import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | D-Menu',
  description: 'Get in touch with D-Menu. Have questions about our QR menu system for restaurants? Contact us via email, phone, or WhatsApp. We typically respond within 24 hours.',
  keywords: [
    'contact D-Menu',
    'restaurant QR menu support',
    'D-Menu customer service',
    'restaurant ordering system contact',
    'QR menu help'
  ].join(', '),
  openGraph: {
    title: 'Contact Us | D-Menu',
    description: 'Get in touch with D-Menu. Have questions about our QR menu system for restaurants?',
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

