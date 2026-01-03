'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import QRCodeModal from '@/components/owner/QRCodeModal';
import { restaurantService } from '@/services/restaurantService';
import { dashboardService, DashboardStats } from '@/services/dashboardService';
import Toast from '@/components/ui/Toast';

export default function OwnerDashboard() {
  const router = useRouter();
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeUrl: string; menuUrl: string; restaurant: any } | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalMenuItems: 0,
    todayOrders: 0,
    pendingOrders: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await dashboardService.getStats();
        setStats(response.data);
      } catch (error: any) {
        console.error('Failed to fetch dashboard stats:', error);
        setToast({
          isVisible: true,
          message: error.message || 'Failed to load dashboard statistics',
          type: 'error',
        });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateQR = async () => {
    setIsLoadingQR(true);
    try {
      const response = await restaurantService.getQRCode();
      setQrData(response.data);
      setIsQRModalOpen(true);
    } catch (error: any) {
      setToast({
        isVisible: true,
        message: error.message || 'Failed to generate QR code',
        type: 'error',
      });
    } finally {
      setIsLoadingQR(false);
    }
  };

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {isLoadingStats ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </>
        ) : (
          <>
            <StatCard
              title="Total Menu Items"
              value={stats.totalMenuItems}
              color="text-blue-600"
              icon={
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
            />
            <StatCard
              title="Today Orders"
              value={stats.todayOrders}
              color="text-green-600"
              icon={
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <StatCard
              title="Pending Orders"
              value={stats.pendingOrders}
              color="text-orange-600"
              icon={
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/owner/dashboard/menu')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#22C55E] hover:bg-green-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="font-medium text-gray-900">Add Menu Item</span>
            </div>
          </button>
          <button
            onClick={() => router.push('/owner/dashboard/orders')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#22C55E] hover:bg-green-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium text-gray-900">View Orders</span>
            </div>
          </button>
          <button
            onClick={handleGenerateQR}
            disabled={isLoadingQR}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#22C55E] hover:bg-green-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <span className="font-medium text-gray-900">
                {isLoadingQR ? 'Generating...' : 'Generate QR Code'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrData && (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => {
            setIsQRModalOpen(false);
            setQrData(null);
          }}
          qrCodeUrl={qrData.qrCodeUrl}
          menuUrl={qrData.menuUrl}
          restaurantName={qrData.restaurant.name}
        />
      )}

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}


