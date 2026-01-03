'use client';

import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsData } from '@/services/analyticsService';
import Toast from '@/components/ui/Toast';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await analyticsService.getOverview();
        setAnalytics(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load analytics');
        setToast({
          isVisible: true,
          message: err.message || 'Failed to load analytics',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  // Format currency (₹)
  const formatCurrency = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '₹0.00';
    }
    return `₹${amount.toFixed(2)}`;
  };

  // Format time (e.g., 7 PM – 8 PM)
  const formatPeakTime = (hour: number | null): string => {
    if (hour === null || hour === undefined || isNaN(hour)) return 'N/A';
    
    const formatHour = (h: number): string => {
      if (h < 0 || h > 23) return 'N/A';
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
      return `${displayHour} ${period}`;
    };

    const startHour = Math.floor(hour);
    const endHour = startHour + 1; // 1-hour window (e.g., 7 PM - 8 PM)
    
    return `${formatHour(startHour)} – ${formatHour(endHour > 23 ? 0 : endHour)}`;
  };

  // Summary Card Component
  const SummaryCard = ({ 
    title, 
    value, 
    icon, 
    color 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className={`text-3xl font-bold ${color}`}>
            {value}
          </p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Insight Card Component
  const InsightCard = ({ 
    title, 
    value, 
    subtitle,
    icon 
  }: { 
    title: string; 
    value: string | number | null; 
    subtitle?: string;
    icon: React.ReactNode;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {value || 'N/A'}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gray-100">
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your restaurant performance and insights</p>
        </div>
        <button
          onClick={async () => {
            try {
              setToast({
                isVisible: true,
                message: 'Downloading monthly report...',
                type: 'info',
              });
              await analyticsService.downloadMonthlyReport();
              setToast({
                isVisible: true,
                message: 'Monthly report downloaded successfully!',
                type: 'success',
              });
            } catch (err: any) {
              setToast({
                isVisible: true,
                message: err.message || 'Failed to download monthly report',
                type: 'error',
              });
            }
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-[#22C55E] text-white rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="font-medium">Download Monthly Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Today Sales
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(analytics.today.totalSalesToday)}
              </p>
              {/* Sales Difference */}
              {analytics.today.salesDifferencePercentage !== 0 && (
                <div className={`flex items-center mt-2 ${analytics.today.salesDifferencePercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analytics.today.salesDifferencePercentage >= 0 ? (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                  <span className="text-sm font-semibold">
                    {analytics.today.salesDifferencePercentage >= 0 ? '+' : ''}
                    {analytics.today.salesDifferencePercentage.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500 ml-1">vs yesterday</span>
                </div>
              )}
              {analytics.today.salesDifferencePercentage === 0 && analytics.today.yesterdaySales === 0 && (
                <div className="flex items-center mt-2 text-gray-500">
                  <span className="text-xs">No previous data</span>
                </div>
              )}
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <SummaryCard
          title="Today Orders"
          value={analytics.today.totalOrdersToday}
          color="text-blue-600"
          icon={
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <SummaryCard
          title="Monthly Sales"
          value={formatCurrency(analytics.monthly.totalSalesThisMonth)}
          color="text-purple-600"
          icon={
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
        <SummaryCard
          title="Monthly Orders"
          value={analytics.monthly.totalOrdersThisMonth}
          color="text-orange-600"
          icon={
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InsightCard
          title="Most Sold Dish"
          value={analytics.mostSoldDish.dishName}
          subtitle={`${analytics.mostSoldDish.quantitySold} orders`}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
        <InsightCard
          title="Peak Order Time"
          value={formatPeakTime(analytics.peakTime.hour)}
          subtitle={`${analytics.peakTime.orderCount} orders`}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <InsightCard
          title="Peak Day"
          value={analytics.peakDay.weekday}
          subtitle={`${analytics.peakDay.orderCount} orders`}
          icon={
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

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

