import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rana Hazir Hai - School Management System',
  description: 'Professional school administrative and attendance management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ur" dir="rtl">
      <body className="antialiased">{children}</body>
    </html>
  )
}
