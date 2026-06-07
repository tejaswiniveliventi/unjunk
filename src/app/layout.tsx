import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Unjunk — Find cleaner alternatives to your favourite foods',
  description: 'Discover healthier alternatives to packaged foods available near you.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}