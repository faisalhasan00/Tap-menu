import type { Metadata } from 'next';
import Image from 'next/image';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export const metadata: Metadata = {
  title: 'QR Menu Restaurant Ordering System | TapMenu',
  description: 'One QR code per restaurant. Customers scan, select table, and order. Track sales analytics. Simple QR menu system for restaurants in India.',
  keywords: [
    'QR menu',
    'restaurant ordering system',
    'QR code menu',
    'digital menu',
    'restaurant QR code',
    'table ordering',
    'restaurant management',
    'restaurant analytics',
    'contactless ordering',
    'restaurant software India',
    'cafe ordering system',
    'dhaba menu system'
  ].join(', '),
  openGraph: {
    title: 'QR Menu Restaurant Ordering System | TapMenu',
    description: 'One QR code per restaurant. Customers scan, select table, and order. Track sales analytics. Simple QR menu system for restaurants in India.',
    type: 'website',
    url: 'https://tapmenu.in', // Placeholder URL
    siteName: 'TapMenu',
    images: [
      {
        url: 'https://dmenu.in/og-image.jpg', // Placeholder image URL
        width: 1200,
        height: 630,
        alt: 'TapMenu - QR Menu Restaurant Ordering System',
      },
    ],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Menu Restaurant Ordering System | TapMenu',
    description: 'One QR code per restaurant. Customers scan, select table, and order. Track sales analytics.',
    images: ['https://dmenu.in/og-image.jpg'], // Placeholder image URL
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://tapmenu.in', // Placeholder URL
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'YOUR_GOOGLE_VERIFICATION_CODE', // Placeholder - add to .env.local
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] overflow-hidden">
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12 md:pb-16 lg:pb-20">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 items-center">
            
            {/* Left Side - Text Content */}
            <div className="text-white text-center lg:text-left order-1 w-full">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start mb-6 sm:mb-8">
                <div className="relative w-[120px] h-[52px] sm:w-[140px] sm:h-[60px]">
                  <Image
                    src="/image/TapMenu_logo.png"
                    alt="TapMenu Logo"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </div>

              {/* Headline - Max 2 lines */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
                <span className="block">Digital Menu</span>
                <span className="block">Made Simple</span>
              </h1>

              {/* Value Text */}
              <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-7 md:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                One QR code. Instant ordering. Complete control from your dashboard.
              </p>

              {/* CTA Buttons - Stacked on mobile, side-by-side on desktop */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start mb-6 sm:mb-8">
                <a
                  href="/owner/login"
                  className="bg-[#22C55E] text-white px-8 py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-[#16A34A] hover:shadow-xl hover:scale-105 text-center min-h-[52px] flex items-center justify-center shadow-lg"
                >
                  Get Started
                </a>
                <WhatsAppButton variant="inline" className="min-h-[52px] text-base sm:text-lg" />
              </div>

              {/* Value Points - Max 3 on mobile, more on desktop */}
              <ul className="space-y-3 sm:space-y-4 max-w-lg mx-auto lg:mx-0">
                <li className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-200">QR code ordering in seconds</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-200">Real-time order tracking</span>
                </li>
                <li className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-sm sm:text-base lg:text-lg text-gray-200">Live analytics & insights</span>
                </li>
              </ul>
            </div>

            {/* Right Side - Phone Mockup - Desktop Version (Hidden on mobile) */}
            <div className="hidden lg:flex justify-center lg:justify-end order-2">
              <div className="relative w-full max-w-[280px] xl:max-w-[320px]">
                {/* Mobile Frame */}
                <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                  <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                    {/* Mobile Screen Content */}
                    <div className="aspect-[9/19] bg-gradient-to-br from-[#F8FAFC] to-white overflow-hidden relative">
                      <img
                        src="/image/TapMenu_UI-removebg-preview.png"
                        alt="TapMenu Mobile App Interface"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
                {/* Subtle Glow Effect */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-[#22C55E] opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute -top-4 -left-4 w-40 h-40 bg-[#22C55E] opacity-10 rounded-full blur-3xl"></div>
              </div>
            </div>

            {/* Phone Mockup - Mobile Version (Shown below content on mobile) */}
            <div className="flex lg:hidden justify-center order-2 mt-4 sm:mt-6 w-full">
              <div className="relative w-full max-w-[180px] sm:max-w-[220px]">
                {/* Mobile Frame */}
                <div className="relative bg-white rounded-[2rem] p-1.5 shadow-xl">
                  <div className="bg-gray-900 rounded-[1.5rem] overflow-hidden">
                    {/* Mobile Screen Content */}
                    <div className="aspect-[9/19] bg-gradient-to-br from-[#F8FAFC] to-white overflow-hidden relative">
                      <img
                        src="/image/TapMenu_UI-removebg-preview.png"
                        alt="TapMenu Mobile App Interface"
                        className="absolute inset-0 w-full h-full object-cover object-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Three simple steps to set up your QR menu for restaurants
            </p>
          </div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="QR code icon for restaurant menu ordering system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#22C55E] mb-4">01</div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
                Place One QR Code
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Place a single QR code in your restaurant. No multiple QRs needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Mobile phone icon for restaurant table ordering system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#22C55E] mb-4">02</div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
                Customer Orders from Table
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Customer scans QR code, selects table number, and places order from their phone using our restaurant table ordering system.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Analytics chart icon for restaurant sales and order management system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="text-3xl font-bold text-[#22C55E] mb-4">03</div>
              <h3 className="text-xl font-semibold text-[#0F172A] mb-3">
                Manage Orders & Sales
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Receive live orders and track daily and monthly sales analytics from your restaurant order management system dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-[#F8FAFC] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              Features
            </h2>
            <p className="text-lg text-gray-600">
              Complete digital menu and restaurant ordering system features
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: One QR Code per Restaurant */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="QR code icon for digital menu system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                One QR Code per Restaurant
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Simple setup, no table-wise QR codes
              </p>
            </div>

            {/* Feature 2: Table-Based Ordering */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Table icon for restaurant table ordering system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Table-Based Ordering
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Restaurant table ordering system where customers select table number and order easily
              </p>
            </div>

            {/* Feature 3: Menu & Stock Management */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Settings icon for restaurant menu and stock management system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Menu & Stock Management
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Add, edit, enable or disable items anytime
              </p>
            </div>

            {/* Feature 4: Live Orders Dashboard */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Checkmark icon for live restaurant orders dashboard"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Live Orders Dashboard
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receive and manage orders in real time
              </p>
            </div>

            {/* Feature 5: Sales Analytics */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                Sales Analytics
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Restaurant sales analytics: view today's sales, monthly sales, top dishes, and peak time
              </p>
            </div>

            {/* Feature 6: No App Needed */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Globe icon for browser-based restaurant ordering system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                No App Needed
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Works on any smartphone browser
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why TapMenu Section */}
      <section id="why-TapMenu" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">
              Why TapMenu
            </h2>
            <p className="text-lg text-gray-600">
              Built for small restaurants who want simple, reliable solutions
            </p>
          </div>

          {/* Value Points Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Value Point 1: Made for Small Restaurants */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Building icon for small restaurant QR menu system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  Made for Small Restaurants
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Simple setup, no complicated system
                </p>
              </div>
            </div>

            {/* Value Point 2: One QR, No Confusion */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Checkmark icon for simple QR code restaurant menu system"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  One QR, No Confusion
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  No multiple QR codes or table mapping issues
                </p>
              </div>
            </div>

            {/* Value Point 3: No App, No Training */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Mobile phone icon for browser-based restaurant ordering"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  No App, No Training
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Customers order from browser, owners manage easily
                </p>
              </div>
            </div>

            {/* Value Point 4: Real Sales Insights */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-[#22C55E] bg-opacity-10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#22C55E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-label="Chart icon for restaurant sales analytics and insights"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  Real Sales Insights
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Know what sells most and when your restaurant is busy
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-[#1E293B] py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Simplify Your Restaurant Orders?
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            Set up TapMenu in minutes and start taking orders with just one QR code.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/owner/login"
              className="bg-[#22C55E] text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:bg-[#16A34A] hover:shadow-lg w-full sm:w-auto"
            >
              Get Started
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-200 hover:bg-white hover:text-[#1E293B] w-full sm:w-auto"
            >
              Book Free Demo
            </a>
          </div>
        </div>
      </section>
      </main>
    </div>
  );
}
