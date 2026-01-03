'use client';

import { usePathname } from 'next/navigation';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define public routes (routes that should show the navbar and footer)
  const publicRoutes = ['/', '/features', '/how-it-works', '/contact'];
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });

  // Don't show navbar/footer on admin/owner/customer menu routes
  const hideNavbarRoutes = ['/super-admin', '/owner', '/r/', '/menu/'];
  const shouldHideNavbar = hideNavbarRoutes.some(route => pathname.startsWith(route));

  const showNavbar = isPublicRoute && !shouldHideNavbar;
  const showFooter = isPublicRoute && !shouldHideNavbar;

  return (
    <>
      {showNavbar && <PublicNavbar />}
      {children}
      {showFooter && <PublicFooter />}
    </>
  );
}

