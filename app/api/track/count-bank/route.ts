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
    const validSlug = validateSlug(body?.guest_slug)
    if (!validSlug) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 })
    }

    const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
    if (!rateLimit(`${ip}:copy_bank`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { data: guest, error: fetchErr } = await supabase
      .from('guests')
      .select('id, copy_bank')
      .eq('slug', validSlug)
      .single()

    if (fetchErr || !guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    const next = (guest.copy_bank ?? 0) + 1
    const { error } = await supabase
      .from('guests')
      .update({ copy_bank: next })
      .eq('slug', validSlug)

    if (error) throw error
    return NextResponse.json({ ok: true, copy_bank: next })
  } catch (err) {
    console.error('copy_bank track error:', err)
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}