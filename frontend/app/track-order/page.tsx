'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { orderService } from '@/services/orderService';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import PublicLayout from '@/components/layouts/PublicLayout';

interface Order {
  _id: string;
  restaurantId: {
    _id: string;
    name: string;
    slug: string;
  } | string;
  tableNumber: number;
  items: Array<{
    menuItemId: string | {
      _id: string;
      name: string;
      price: number;
      image?: string;
    };
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'READY';
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED':
      return 'bg-blue-100 text-blue-800';
    case 'REJECTED':
      return 'bg-red-100 text-red-800';
    case 'READY':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'Pending';
    case 'ACCEPTED':
      return 'Accepted';
    case 'REJECTED':
      return 'Rejected';
    case 'READY':
      return 'Ready';
    default:
      return status;
  }
};

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [trackingId, setTrackingId] = useState<string>('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      setTrackingId(idFromUrl);
      handleTrack(idFromUrl);
    }
  }, [searchParams]);

  const handleTrack = async (id?: string) => {
    const trackId = id || trackingId.trim().toUpperCase();
    
    if (!trackId) {
      setError('Please enter a tracking ID');
      return;
    }

    setLoading(true);
    setError('');
    setSearched(true);
    setOrder(null);

    try {
      const response = await orderService.getOrderByTrackingId(trackId);
      setOrder(response.data);
    } catch (err: any) {
      setError(err.message || 'Order not found. Please check your tracking ID.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleTrack();
  };

  const restaurantName = order?.restaurantId && typeof order.restaurantId === 'object' 
    ? order.restaurantId.name 
    : 'Restaurant';

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
            <p className="text-gray-600">Enter your tracking ID to check the status of your order</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trackingId" className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking ID
                </label>
                <Input
                  id="trackingId"
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter tracking ID (e.g., TM-ABC123)"
                  className="w-full"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                isLoading={loading}
                disabled={loading || !trackingId.trim()}
                className="w-full"
                variant="primary"
              >
                {loading ? 'Tracking...' : 'Track Order'}
              </Button>
            </form>
          </div>

          {/* Error Message */}
          {error && searched && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Restaurant</p>
                    <p className="font-semibold text-gray-900">{restaurantName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Table Number</p>
                    <p className="font-semibold text-gray-900">Table {order.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Tracking ID</p>
                    <p className="font-semibold text-[#22C55E]">{order.trackingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-[#22C55E]">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                <div className="space-y-4">
                  <div className={`flex items-center ${order.status !== 'PENDING' ? 'opacity-50' : ''}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'PENDING' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-600">Your order has been received</p>
                    </div>
                  </div>
                  <div className={`flex items-center ${!['ACCEPTED', 'READY'].includes(order.status) ? 'opacity-50' : ''}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${['ACCEPTED', 'READY'].includes(order.status) ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Accepted</p>
                      <p className="text-sm text-gray-600">Restaurant is preparing your order</p>
                    </div>
                  </div>
                  <div className={`flex items-center ${order.status !== 'READY' ? 'opacity-50' : ''}`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'READY' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <div>
                      <p className="font-medium text-gray-900">Order Ready</p>
                      <p className="text-sm text-gray-600">Your order is ready for pickup</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-[#22C55E] hover:text-[#16A34A] font-semibold"
            >
              ← Back to Home
            </button>
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </PublicLayout>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}

