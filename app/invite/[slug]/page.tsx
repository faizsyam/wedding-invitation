import { supabase } from '@/lib/supabase'
import InviteClient from './InviteClient'
import { notFound } from 'next/navigation'

export default async function InvitePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data: guest, error } = await supabase
    .from('guests')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !guest) {
    notFound()
  }

  return <InviteClient guest={guest} />
}