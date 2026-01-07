'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PublicLayout from '@/components/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import OrderReceipt from '@/components/customer/OrderReceipt';
import { frontendRoutes } from '@/config/routes';
import { generateInvoice } from '@/utils/invoiceGenerator';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [orderData, setOrderData] = useState<{
    restaurantName: string;
    orderId: string;
    trackingId: string; // For backward compatibility
    trackingNumber?: string; // New format: DM-ORD-{number}
    tableNumber: number;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalAmount: number;
    orderDate: string;
    estimatedTime: number;
  } | null>(null);

  useEffect(() => {
    // Get order data from URL params or localStorage
    const orderId = searchParams.get('orderId');
    const trackingId = searchParams.get('trackingId');
    const restaurantName = searchParams.get('restaurantName');
    const tableNumber = searchParams.get('tableNumber');
    
    // Try to get from localStorage (set by CheckoutModal)
    const storedOrderData = localStorage.getItem('orderSuccessData');
    
    if (storedOrderData) {
      try {
        const parsed = JSON.parse(storedOrderData);
        setOrderData(parsed);
        // Clear from localStorage after reading
        localStorage.removeItem('orderSuccessData');
      } catch (error) {
        console.error('Failed to parse order data:', error);
      }
    } else if (orderId && trackingId && restaurantName && tableNumber) {
      // Fallback to URL params if localStorage not available
      const itemsParam = searchParams.get('items');
      const totalAmountParam = searchParams.get('totalAmount');
      const orderDateParam = searchParams.get('orderDate');
      const estimatedTimeParam = searchParams.get('estimatedTime');
      
      setOrderData({
        restaurantName: decodeURIComponent(restaurantName),
        orderId,
        trackingId,
        tableNumber: parseInt(tableNumber, 10),
        items: itemsParam ? JSON.parse(decodeURIComponent(itemsParam)) : [],
        totalAmount: totalAmountParam ? parseFloat(totalAmountParam) : 0,
        orderDate: orderDateParam || new Date().toISOString(),
        estimatedTime: estimatedTimeParam ? parseInt(estimatedTimeParam, 10) : 15,
      });
    } else {
      // No order data found, redirect to home
      router.push('/');
    }
  }, [searchParams, router]);

  const handleTrackOrder = () => {
    const trackingNumber = orderData?.trackingNumber || orderData?.trackingId;
    if (trackingNumber) {
      router.push(frontendRoutes.customer.track(trackingNumber));
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orderData) return;

    try {
      await generateInvoice({
        restaurantName: orderData.restaurantName,
        orderId: orderData.orderId,
        trackingNumber: orderData.trackingNumber || orderData.trackingId,
        orderDate: orderData.orderDate,
        tableNumber: orderData.tableNumber,
        items: orderData.items,
        totalAmount: orderData.totalAmount,
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert(error.message || 'Failed to download invoice. Please try again.');
    }
  };

  // Format estimated preparation time
  const formatEstimatedTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };

  const estimatedTimeText = orderData ? formatEstimatedTime(orderData.estimatedTime) : '15 minutes';

  if (!orderData) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E] mb-4"></div>
            <p className="text-[#0F172A]">Loading order details...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#22C55E] bg-opacity-10 rounded-full flex items-center justify-center">
                <svg 
                  className="w-12 h-12 text-[#22C55E]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={3} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-3">
                Order Placed Successfully!
              </h1>
              <p className="text-lg text-gray-600 mb-2">
                Thank you for your order
              </p>
              <p className="text-base text-gray-500">
                We've received your order and will start preparing it right away.
              </p>
            </div>

            {/* Order Information Card */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4">
              {/* Restaurant Name */}
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                <p className="text-xl font-bold text-[#0F172A]">{orderData.restaurantName}</p>
              </div>

              {/* Order Tracking Number */}
              <div className="text-center pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Order Tracking Number</p>
                <p className="text-2xl font-bold text-[#22C55E] tracking-wider">
                  {orderData.trackingNumber || orderData.trackingId}
                </p>
                <p className="text-xs text-gray-500 mt-1">Order ID: {orderData.orderId.substring(0, 12)}...</p>
              </div>

              {/* Estimated Preparation Time */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Estimated Preparation Time</p>
                <p className="text-lg font-semibold text-[#0F172A]">
                  {estimatedTimeText}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleTrackOrder}
                className="w-full"
                variant="primary"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                    />
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                    />
                  </svg>
                  Track Order
                </span>
              </Button>

              <Button
                onClick={handleDownloadInvoice}
                className="w-full"
                variant="secondary"
                size="lg"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                    />
                  </svg>
                  Download Invoice
                </span>
              </Button>
            </div>
          </div>

          {/* Order Receipt Section */}
          <div ref={receiptRef} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0F172A] mb-4 text-center">
              Order Receipt
            </h2>
            <div data-receipt>
              <div data-receipt-content>
                <OrderReceipt
                  restaurantName={orderData.restaurantName}
                  tableNumber={orderData.tableNumber}
                  trackingId={orderData.trackingId}
                  trackingNumber={orderData.trackingNumber}
                  orderNumber={orderData.orderId}
                  items={orderData.items}
                  totalAmount={orderData.totalAmount}
                  orderDate={orderData.orderDate}
                  hideDownloadButtons={true}
                />
              </div>
            </div>
          </div>

          {/* Back to Home Link */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-[#22C55E] hover:text-[#16A34A] font-semibold transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E] mb-4"></div>
            <p className="text-[#0F172A]">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
