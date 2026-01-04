import type { Metadata } from 'next'
import './globals.css'
import PublicLayout from '@/components/layouts/PublicLayout'

export const metadata: Metadata = {
  title: {
    default: 'TapMenu - QR Menu Restaurant Ordering System',
    template: '%s | TapMenu',
  },
  description: 'Simple QR ordering system for restaurants. One QR code per restaurant. Customers order from their table.',
  metadataBase: new URL('https://dmenu.in'), // Placeholder URL - update with actual domain
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <PublicLayout>{children}</PublicLayout>
      </body>
    </html>
  )
}


