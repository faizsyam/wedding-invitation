import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/ratelimit'
import { sanitizeText, truncateText, validateSlug } from '@/lib/sanitize'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const NOTE_MAX = 280
const ALLOWED_ATTENDING = [true, false]

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const guestSlugRaw = body?.guest_slug
    const attending = body?.attending
    const pax = body?.pax
    const noteRaw = body?.note

    // --- Validate and sanitize slug ---
    const validSlug = validateSlug(guestSlugRaw)
    if (!validSlug)
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })

    // --- Validate attending ---
    if (!ALLOWED_ATTENDING.includes(attending))
      return NextResponse.json({ error: 'Invalid attending value' }, { status: 400 })

    // --- Validate pax ---
    if (typeof pax !== 'number' || pax < 0 || pax > 10 || !Number.isInteger(pax))
      return NextResponse.json({ error: 'Invalid pax' }, { status: 400 })

    // --- Sanitize note ---
    const sanitizedNote = sanitizeText(noteRaw)
    if (sanitizedNote.length > NOTE_MAX)
      return NextResponse.json({ error: 'Note too long' }, { status: 400 })

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    const allowed = rateLimit(`${ip}:${validSlug}`, 10, 60_000)
    if (!allowed)
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    // Verify guest exists — prevents writes for invented slugs
    const { data: guest, error: guestErr } = await supabase
      .from('guests')
      .select('id, name, max_guests, is_group')
      .eq('slug', validSlug)
      .maybeSingle()

    if (guestErr || !guest)
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })

    // Server-side pax cap
    const maxPax = guest.max_guests ?? 2
    if (attending && pax > maxPax)
      return NextResponse.json({ error: 'Pax exceeds allowance' }, { status: 400 })

    const rsvpData = {
      guest_slug: validSlug,
      guest_name: guest.name,
      attending,
      pax: attending ? pax : 0,
      note: truncateText(sanitizedNote, NOTE_MAX),
    }

    // Group guests: always insert a new row
    // Non-group guests: upsert (replace previous)
    if (guest.is_group) {
      const { error } = await supabase.from('rsvps').insert(rsvpData)
      if (error) throw error
    } else {
      // Delete existing row (if any) then insert fresh
      await supabase.from('rsvps').delete().eq('guest_slug', validSlug)
      const { error } = await supabase.from('rsvps').insert(rsvpData)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('RSVP error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}