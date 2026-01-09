'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PublicLayout from '@/components/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { frontendRoutes } from '@/config/routes';

/**
 * ============================================
 * PART 3: /track FALLBACK PAGE
 * ============================================
 * This page handles /track route (without tracking ID)
 * Provides a simple UI for users to enter their tracking ID
 */
export default function TrackOrderPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState('');
  const [error, setError] = useState('');

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim and validate tracking ID
    const trimmedId = trackingId.trim();
    
    if (!trimmedId) {
      setError('Please enter a tracking ID or order number');
      return;
    }

    // Clear any previous errors
    setError('');

    // Navigate to tracking page with the ID
    const trackUrl = frontendRoutes.customer.track(trimmedId);
    console.log('🔘 [TRACK_PAGE] Navigating to:', trackUrl);
    router.push(trackUrl);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTrackingId(value);
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[#0F172A] mb-2">Track Your Order</h1>
              <p className="text-gray-600">
                Enter your tracking number or order ID to view your order status
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleTrack} className="space-y-6">
              <div>
                <Input
                  label="Tracking Number or Order ID"
                  type="text"
                  placeholder="e.g., DM-ORD-123456 or TM-XXXX"
                  value={trackingId}
                  onChange={handleInputChange}
                  error={error}
                  autoFocus
                  className="text-center text-lg font-semibold tracking-wider uppercase"
                />
                <p className="mt-2 text-sm text-gray-500 text-center">
                  You can find your tracking number in your order confirmation email or receipt
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Track Order
                </span>
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Need help?{' '}
                <a href="/contact" className="text-[#22C55E] hover:text-[#16A34A] font-semibold">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
