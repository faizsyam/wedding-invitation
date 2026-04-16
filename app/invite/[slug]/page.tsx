import { supabase } from '@/lib/supabase'
import InviteClient from './InviteClient'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params

  const { data: guest } = await supabase
    .from('guests')
    .select('name')
    .eq('slug', slug)
    .single()

  const guestName = guest?.name ?? 'Anda'
  const baseUrl = 'https://wedding-vanya-faiz.vercel.app/'

  return {
    title: 'Undangan Pernikahan | Faiz & Vanya',
    description: `Kepada ${guestName}, kami mengundang Anda untuk hadir di hari istimewa kami. 26 Juni 2026 · Jakarta`,
    openGraph: {
      title: 'Undangan Pernikahan | Faiz & Vanya',
      description: `Kepada ${guestName}, kami mengundang Anda untuk hadir. 26 Juni 2026 · Jakarta`,
      url: `${baseUrl}/invite/${slug}`,
      siteName: 'Undangan Pernikahan Faiz & Vanya',
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: 'Undangan Pernikahan Faiz & Vanya',
        },
      ],
      locale: 'id_ID',
      type: 'website',
    },
  }
}

export default async function InvitePage({ params }: Props) {
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