import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'
import { sanitizeText, truncateText, validateSlug } from '@/lib/sanitize'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MSG_MAX   = 280
const MSG_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guestSlugRaw = body?.guest_slug
    const guestNameRaw = body?.guest_name
    const messageRaw = body?.message

    // --- Validate and sanitize inputs before touching DB ---
    const validSlug = validateSlug(guestSlugRaw)
    if (!validSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const sanitizedMessage = sanitizeText(messageRaw)
    if (sanitizedMessage.length === 0) {
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    }
    if (sanitizedMessage.length > MSG_MAX) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })
    }

    // Rate limit by cleaned slug
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = rateLimit(`${ip}:${validSlug}`, 10, 60_000) // 10 req/min per IP+slug
    if (!allowed)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Verify guest exists
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, name')
      .eq('slug', validSlug)
      .maybeSingle()

    if (guestErr || !guest)
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

    // Server-side message count cap
    const { count, error: countErr } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('guest_slug', validSlug)

    if (countErr) throw countErr
    if ((count ?? 0) >= MSG_LIMIT)
      return NextResponse.json({ error: 'Message limit reached' }, { status: 429 })

    const finalMessage = truncateText(sanitizedMessage, MSG_MAX)
    const finalGuestName = guestNameRaw ? sanitizeText(String(guestNameRaw)) : guest.name
    const { error } = await supabase.from('messages').insert({
      guest_slug: validSlug,
      guest_name: finalGuestName,
      message:    finalMessage,
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}