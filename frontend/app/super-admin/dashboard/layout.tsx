'use client';

import { usePathname } from 'next/navigation';
import SuperAdminLayout from '@/components/layouts/SuperAdminLayout';

const pageTitles: Record<string, string> = {
  '/super-admin/dashboard': 'Dashboard',
  '/super-admin/dashboard/restaurants': 'Restaurants',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || 'Dashboard';

  return (
    <SuperAdminLayout pageTitle={pageTitle}>
      {children}
    </SuperAdminLayout>
  );
}

