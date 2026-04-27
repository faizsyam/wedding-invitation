import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const NOTE_MAX   = 280
const ALLOWED_ATTENDING = [true, false]

export async function POST(req: NextRequest) {
  try {
    const { guest_slug, attending, pax, note } = await req.json()

    // Type + presence checks
    if (typeof guest_slug !== 'string' || !guest_slug.trim())
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    if (!ALLOWED_ATTENDING.includes(attending))
      return NextResponse.json({ error: 'Invalid attending value' }, { status: 400 })
    if (typeof pax !== 'number' || pax < 0 || pax > 10 || !Number.isInteger(pax))
      return NextResponse.json({ error: 'Invalid pax' }, { status: 400 })
    if (note && (typeof note !== 'string' || note.length > NOTE_MAX))
      return NextResponse.json({ error: 'Note too long' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = rateLimit(`${ip}:${guest_slug}`, 10, 60_000) // 10 req/min per IP+slug
    if (!allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Verify guest exists — prevents writes for invented slugs
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, name, max_guests')
      .eq('slug', guest_slug.trim())
      .maybeSingle()

    if (guestErr || !guest)
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

    // Server-side pax cap
    const maxPax = guest.max_guests ?? 2
    if (attending && pax > maxPax)
      return NextResponse.json({ error: 'Pax exceeds allowance' }, { status: 400 })

    // Upsert by slug — handles both insert and update atomically
    const { error } = await supabase
      .from('rsvps')
      .upsert(
        {
          guest_slug: guest_slug.trim(),
          guest_name: guest.name,        // always from DB, not client
          attending,
          pax: attending ? pax : 0,
          note: note?.trim() ?? '',
        },
        { onConflict: 'guest_slug' }
      )

    if (error) throw error
    return NextResponse.json({ ok: true })
    } catch (err) {
        console.error('RSVP error:', err)
        return NextResponse.json({ error: (err as Error).message }, { status: 500 })
    }
}