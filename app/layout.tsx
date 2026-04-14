import './globals.css'

export const metadata = {
  title: 'Undangan Pernikahan',
  description: 'Anda diundang untuk hadir di hari istimewa kami.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}