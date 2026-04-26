import type { ReactNode } from 'react'
import './globals.css'
import SmoothScroll from '@/components/SmoothScroll'

export const metadata = {
  title: 'Undangan Pernikahan',
  description: 'Anda diundang untuk hadir di hari istimewa kami.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  )
}