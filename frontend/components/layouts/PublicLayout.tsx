'use client';

import { usePathname } from 'next/navigation';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';
import WhatsAppButton from '@/components/ui/WhatsAppButton';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define public routes (routes that should show the navbar and footer)
  const isPublicRoute = 
    pathname === '/' ||
    pathname.startsWith('/features') ||
    pathname.startsWith('/how-it-works') ||
    pathname.startsWith('/contact') ||
    pathname === '/track-order' ||
    pathname === '/track' ||
    pathname.startsWith('/track/');

  // Don't show navbar/footer on admin/owner/customer menu routes
  const hideNavbarRoutes = ['/super-admin', '/owner', '/r/', '/menu/'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => pathname.startsWith(route));

  const showNavbar = isPublicRoute && !shouldHideNavbar;
  const showFooter = isPublicRoute && !shouldHideNavbar;
  
  // Show WhatsApp button on all public routes
  const showWhatsApp = isPublicRoute;

  return (
    <>
      {showNavbar && <PublicNavbar />}
      {children}
      {showFooter && <PublicFooter />}
      {/* Floating WhatsApp Button - Visible on all public pages */}
      {showWhatsApp && <WhatsAppButton variant="floating" />}
    </>
  );
}

