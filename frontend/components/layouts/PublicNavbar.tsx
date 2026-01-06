'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function PublicNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('.mobile-menu') && !target.closest('.hamburger-button')) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const menuItems = [
    { name: 'Home', href: '/', anchor: null },
    { name: 'Features', href: '/', anchor: '#features' },
    { name: 'How It Works', href: '/', anchor: '#how-it-works' },
    { name: 'Contact', href: '/contact', anchor: '#Contact' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f2a44] border-b border-[#E2E8F0] h-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* Logo */}
          {/* Logo */}
<Link href="/" className="flex items-center">
  <div className="relative w-[110px] h-[48px]">
    <Image
      src="/image/TapMenu_logo.png"
      alt="TapMenu Logo"
      fill
      className="object-contain"
      priority
    />
  </div>
</Link>


          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.href + (item.anchor || '')}
                href={item.anchor ? `${item.href}${item.anchor}` : item.href}
                className={`text-[#f7f7f8] font-medium transition-colors duration-200 hover:text-[#22C55E] ${isActive(item.href) ? 'text-[#22C55E]' : ''
                  }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/owner/login"
              className="bg-[#22C55E] text-white px-6 py-2.5 rounded-full font-medium transition-all duration-200 hover:bg-[#16A34A] hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden hamburger-button flex flex-col items-center justify-center w-8 h-8 space-y-1.5 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span
              className={`block w-6 h-0.5 bg-[#0F172A] transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#0F172A] transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''
                }`}
            />
            <span
              className={`block w-6 h-0.5 bg-[#0F172A] transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`mobile-menu md:hidden bg-white border-t border-[#E2E8F0] transition-all duration-300 ease-in-out ${isMobileMenuOpen
            ? 'max-h-96 opacity-100'
            : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <div className="px-4 py-6 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.href + (item.anchor || '')}
              href={item.anchor ? `${item.href}${item.anchor}` : item.href}
              className={`block text-[#0F172A] font-medium py-2 transition-colors duration-200 hover:text-[#22C55E] ${isActive(item.href) ? 'text-[#22C55E]' : ''
                }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/owner/login"
            className="block bg-[#22C55E] text-white px-6 py-2.5 rounded-full font-medium text-center transition-all duration-200 hover:bg-[#16A34A] mt-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
