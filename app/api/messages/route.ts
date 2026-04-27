import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const MSG_MAX   = 280
const MSG_LIMIT = 3

export async function POST(req: NextRequest) {
  try {
    const { guest_slug, message } = await req.json()

    if (typeof guest_slug !== 'string' || !guest_slug.trim())
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    if (typeof message !== 'string' || !message.trim())
      return NextResponse.json({ error: 'Empty message' }, { status: 400 })
    if (message.length > MSG_MAX)
      return NextResponse.json({ error: 'Message too long' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = rateLimit(`${ip}:${guest_slug}`, 10, 60_000) // 10 req/min per IP+slug
    if (!allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Verify guest exists
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, name')
      .eq('slug', guest_slug.trim())
      .maybeSingle()

    if (guestErr || !guest)
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

    // Server-side message count cap
    const { count, error: countErr } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('guest_slug', guest_slug.trim())

    if (countErr) throw countErr
    if ((count ?? 0) >= MSG_LIMIT)
      return NextResponse.json({ error: 'Message limit reached' }, { status: 429 })

    const { error } = await supabase.from('messages').insert({
      guest_slug: guest_slug.trim(),
      guest_name: guest.name,           // always from DB
      message:    message.trim(),
    })

    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}