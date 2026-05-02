'use client'

import InviteCover from './invite/[slug]/InviteCover'

export default function Home() {
  const dummyGuest = {
    id: 0,
    name: '',
    slug: '',
    created_at: '',
    max_guests: null,
  }

  return (
    <InviteCover
      guest={dummyGuest}
      onOpen={() => {}}
      preview={true}
    />
  )
}