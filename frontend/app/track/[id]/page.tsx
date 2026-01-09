'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orderService, Order } from '@/services/orderService';
import PublicLayout from '@/components/layouts/PublicLayout';
import Button from '@/components/ui/Button';
import { generateInvoiceFromOrder } from '@/utils/invoiceGenerator';

interface OrderTrackingData extends Order {
  restaurantId: {
    _id: string;
    name: string;
    slug: string;
  } | string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'ACCEPTED':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'REJECTED':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'READY':
      return 'bg-green-100 text-green-800 border-green-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Order Placed';
    case 'ACCEPTED':
      return 'Order Accepted';
    case 'REJECTED':
      return 'Order Rejected';
    case 'READY':
      return 'Order Ready';
    default:
      return status;
  }
};

const getStatusIcon = (status: string, isActive: boolean) => {
  const baseClasses = 'w-6 h-6';
  
  if (!isActive) {
    return (
      <svg className={`${baseClasses} text-gray-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  }

  switch (status) {
    case 'PENDING':
      return (
        <svg className={`${baseClasses} text-yellow-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'ACCEPTED':
      return (
        <svg className={`${baseClasses} text-blue-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'REJECTED':
      return (
        <svg className={`${baseClasses} text-red-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'READY':
      return (
        <svg className={`${baseClasses} text-green-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    default:
      return null;
  }
};

function TrackOrderContent() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderTrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const orderId = params?.id as string;

  // ============================================
  // PART 1: FIX BLINKING ISSUE
  // ============================================
  // PROBLEM: Having 'order' in dependency array causes infinite loop
  // SOLUTION: Only depend on 'orderId', separate interval logic
  
  // Effect 1: Fetch order when trackingId changes
  useEffect(() => {
    console.log('🔄 [TRACK_PAGE] Component mounted/updated');
    console.log('🔄 [TRACK_PAGE] Route params:', params);
    console.log('🔄 [TRACK_PAGE] Tracking ID from params (raw):', orderId);
    
    // ============================================
    // RULE: NO auto-navigation, just render error
    // ============================================
    if (!orderId) {
      console.error('❌ [TRACK_PAGE] No tracking ID in route params');
      setError('Invalid tracking ID or order number');
      setLoading(false);
      setOrder(null);
      return;
    }

    // Next.js automatically decodes route parameters
    console.log('🔄 [TRACK_PAGE] Tracking identifier (ready for API):', orderId);

    const fetchOrder = async () => {
      try {
        console.log('📡 [TRACK_PAGE] Fetching order with identifier:', orderId);
        setLoading(true);
        setError('');
        
        // Use orderId directly (Next.js already decoded it)
        const response = await orderService.getOrderByTrackingId(orderId);
        console.log('✅ [TRACK_PAGE] Order fetched successfully:', {
          orderId: response.data._id,
          trackingNumber: response.data.trackingNumber,
          trackingId: response.data.trackingId,
          status: response.data.status
        });
        
        setOrder(response.data);
        
        // Calculate time remaining if order is not ready/rejected
        if (response.data.status !== 'READY' && response.data.status !== 'REJECTED') {
          const orderDate = new Date(response.data.createdAt);
          const estimatedMinutes = response.data.estimatedTime || 15;
          const estimatedCompletion = new Date(orderDate.getTime() + estimatedMinutes * 60000);
          const now = new Date();
          const remaining = Math.max(0, Math.ceil((estimatedCompletion.getTime() - now.getTime()) / 60000));
          setTimeRemaining(remaining);
        } else {
          setTimeRemaining(null);
        }
      } catch (err: any) {
        console.error('❌ [TRACK_PAGE] Error fetching order:', err);
        console.error('❌ [TRACK_PAGE] Error details:', {
          message: err.message,
          trackingId: orderId,
          error: err
        });
        setError(err.message || 'Order not found. Please check your tracking number or order ID.');
        setOrder(null);
        setTimeRemaining(null);
      } finally {
        setLoading(false);
        console.log('🏁 [TRACK_PAGE] Fetch completed');
      }
    };

    fetchOrder();
    
    // ============================================
    // CRITICAL: Only depend on orderId, NOT order
    // This prevents infinite re-render loop
    // ============================================
  }, [orderId, params]);

  // Effect 2: Update time remaining every minute (separate from fetch)
  useEffect(() => {
    if (!order || order.status === 'READY' || order.status === 'REJECTED') {
      setTimeRemaining(null);
      return;
    }

    // Calculate initial time remaining
    const calculateTimeRemaining = () => {
      const orderDate = new Date(order.createdAt);
      const estimatedMinutes = order.estimatedTime || 15;
      const estimatedCompletion = new Date(orderDate.getTime() + estimatedMinutes * 60000);
      const now = new Date();
      const remaining = Math.max(0, Math.ceil((estimatedCompletion.getTime() - now.getTime()) / 60000));
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();

    // Update every minute
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [order]);

  const restaurantName = order?.restaurantId && typeof order.restaurantId === 'object' 
    ? order.restaurantId.name 
    : 'Restaurant';

  const trackingNumber = order?.trackingNumber || order?.trackingId || 'N/A';

  // Status timeline configuration
  const statusTimeline = [
    {
      status: 'PENDING',
      label: 'Order Placed',
      description: 'Your order has been received',
      isActive: order?.status === 'PENDING',
      isCompleted: ['ACCEPTED', 'READY'].includes(order?.status || '')
    },
    {
      status: 'ACCEPTED',
      label: 'Order Accepted',
      description: 'Restaurant is preparing your order',
      isActive: order?.status === 'ACCEPTED',
      isCompleted: order?.status === 'READY'
    },
    {
      status: 'READY',
      label: 'Order Ready',
      description: 'Your order is ready for pickup',
      isActive: order?.status === 'READY',
      isCompleted: order?.status === 'READY'
    }
  ];

  const formatTimeRemaining = (minutes: number): string => {
    if (minutes <= 0) return 'Ready soon';
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''} remaining`;
    }
    return `${hours}h ${remainingMinutes}m remaining`;
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;

    try {
      await generateInvoiceFromOrder(order, restaurantName);
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert(error.message || 'Failed to download invoice. Please try again.');
    }
  };

  // ============================================
  // PART 2: STABLE RENDER LOGIC (NON-NEGOTIABLE)
  // ============================================
  // Render order MUST be:
  // a) Missing trackingId → friendly message (NO redirect)
  // b) Loading → stable loading UI (NO redirect)
  // c) Error → error message
  // d) Success → tracking UI

  // a) If trackingId is missing: render friendly message
  if (!orderId) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Tracking ID Required</h1>
              <p className="text-gray-600 mb-6">
                Please provide a tracking ID or order number to view your order status.
              </p>
              <Button
                onClick={() => router.push('/track')}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Enter Tracking ID
              </Button>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // b) If loading: render stable loading UI
  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E] mb-4"></div>
            <p className="text-[#0F172A] text-lg">Loading order details...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !order) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-[#0F172A] mb-3">Order Not Found</h1>
              <p className="text-gray-600 mb-6">{error || 'The order you are looking for could not be found.'}</p>
              <div className="space-y-3">
                <Button
                  onClick={() => router.push('/track-order')}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Search Another Order
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="secondary"
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Back to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <button
                onClick={() => router.push('/track-order')}
                className="text-[#22C55E] hover:text-[#16A34A] font-semibold flex items-center gap-2 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Search
              </button>
              <Button
                onClick={handleDownloadInvoice}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Invoice
                </span>
              </Button>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2">Track Your Order</h1>
            <p className="text-gray-600">Tracking Number: <span className="font-semibold text-[#22C55E]">{trackingNumber}</span></p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content - Status Timeline */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[#0F172A]">Order Status</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {/* Time Remaining */}
                {timeRemaining !== null && order.status !== 'REJECTED' && (
                  <div className="bg-[#22C55E] bg-opacity-10 border-2 border-[#22C55E] rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <svg className="w-6 h-6 text-[#22C55E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-600">Estimated Time Remaining</p>
                        <p className="text-xl font-bold text-[#22C55E]">{formatTimeRemaining(timeRemaining)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="space-y-6">
                  {statusTimeline.map((step, index) => {
                    const isStepActive = step.isActive || step.isCompleted;
                    const isLast = index === statusTimeline.length - 1;

                    return (
                      <div key={step.status} className="flex gap-4">
                        {/* Timeline Line */}
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                            step.isCompleted 
                              ? 'bg-[#22C55E] border-[#22C55E]' 
                              : step.isActive 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'bg-gray-200 border-gray-300'
                          }`}>
                            {getStatusIcon(step.status, isStepActive)}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 mt-2 ${
                              step.isCompleted ? 'bg-[#22C55E]' : 'bg-gray-200'
                            }`} style={{ minHeight: '60px' }}></div>
                          )}
                        </div>

                        {/* Timeline Content */}
                        <div className="flex-1 pb-6">
                          <h3 className={`text-lg font-semibold mb-1 ${
                            isStepActive ? 'text-[#0F172A]' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </h3>
                          <p className={`text-sm ${
                            isStepActive ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Order Details */}
            <div className="space-y-6">
              {/* Order Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#0F172A] mb-4">Order Details</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Restaurant</p>
                    <p className="font-semibold text-[#0F172A]">{restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Table Number</p>
                    <p className="font-semibold text-[#0F172A]">Table {order.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                    <p className="font-semibold text-[#22C55E]">{trackingNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Order Date</p>
                    <p className="font-semibold text-[#0F172A]">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {order.estimatedTime && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Estimated Preparation</p>
                      <p className="font-semibold text-[#0F172A]">
                        {order.estimatedTime} minute{order.estimatedTime !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-[#0F172A] mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-[#0F172A]">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ₹{item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-[#0F172A]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-[#0F172A]">Total</span>
                    <span className="text-2xl font-bold text-[#22C55E]">
                      ₹{order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E] mb-4"></div>
            <p className="text-[#0F172A] text-lg">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
