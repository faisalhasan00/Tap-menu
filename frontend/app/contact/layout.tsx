import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | TapMenu',
  description: 'Get in touch with TapMenu. Have questions about our QR menu system for restaurants? Contact us via email, phone, or WhatsApp. We typically respond within 24 hours.',
  keywords: [
    'contact TapMenu',
    'restaurant QR menu support',
    'TapMenu customer service',
    'restaurant ordering system contact',
    'QR menu help'
  ].join(', '),
  openGraph: {
    title: 'Contact Us | TapMenu',
    description: 'Get in touch with TapMenu. Have questions about our QR menu system for restaurants?',
    type: 'website',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

