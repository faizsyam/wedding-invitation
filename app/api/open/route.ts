import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'
import { validateSlug } from '@/lib/sanitize'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guestSlugRaw = body?.guest_slug

    // --- Validate and sanitize slug ---
    const validSlug = validateSlug(guestSlugRaw)
    if (!validSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    // --- Rate limit ---
    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = rateLimit(`${ip}:open`, 5, 60_000) // 5 req/min per IP
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // --- Verify guest exists ---
    const { data: guest, error: fetchErr } = await supabase
      .from('guests')
      .select('id, open_count')
      .eq('slug', validSlug)
      .single()

    if (fetchErr || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // --- Increment open_count (NULL treated as 0) ---
    const currentCount = guest.open_count ?? 0
    const { error } = await supabase
      .from('guests')
      .update({ open_count: currentCount + 1 })
      .eq('slug', validSlug)

    if (error) throw error

    return NextResponse.json({ ok: true, open_count: currentCount + 1 })
  } catch (err) {
    console.error('Open count error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
