import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { validateSlug } from '@/lib/sanitize'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const slugRaw = req.nextUrl.searchParams.get('slug')
  const validSlug = validateSlug(slugRaw)
  if (!validSlug) return NextResponse.json({ exists: false })
  const { data } = await supabase
    .from('rsvps').select('id').eq('guest_slug', validSlug).maybeSingle()
  return NextResponse.json({ exists: !!data })
}