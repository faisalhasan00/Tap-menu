'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderCard from '@/components/orders/OrderCard';
import { orderService, Order } from '@/services/orderService';

type OrderStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'READY' | 'ALL';

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get('status') as OrderStatus | null;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    (statusFromUrl && ['PENDING', 'ACCEPTED', 'REJECTED', 'READY'].includes(statusFromUrl)) 
      ? statusFromUrl 
      : 'ALL'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const previousOrderIdsRef = useRef<Set<string>>(new Set());

  const fetchOrders = async () => {
    try {
      const status = selectedStatus === 'ALL' ? undefined : selectedStatus;
      const response = await orderService.getOrders(status);
      
      // Detect new orders
      const currentOrderIds = new Set(response.data.map(order => order._id));
      const newIds = new Set(
        Array.from(currentOrderIds).filter(id => !previousOrderIdsRef.current.has(id))
      );
      
      if (newIds.size > 0) {
        setNewOrderIds(newIds);
        // Clear new order highlight after 5 seconds
        setTimeout(() => {
          setNewOrderIds((prev) => {
            const updated = new Set(prev);
            newIds.forEach(id => updated.delete(id));
            return updated;
          });
        }, 5000);
      }

      previousOrderIdsRef.current = currentOrderIds;
      setOrders(response.data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    
    return () => clearInterval(interval);
  }, [selectedStatus]);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  const handleStatusUpdate = () => {
    fetchOrders();
  };

  const statusFilters: { label: string; value: OrderStatus; count?: number }[] = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Ready', value: 'READY' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const getStatusCount = (status: OrderStatus) => {
    if (status === 'ALL') return orders.length;
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-gray-600">Manage and track restaurant orders in real-time</p>
      </div>

      {/* Status Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => {
            const count = getStatusCount(filter.value);
            return (
              <button
                key={filter.value}
                onClick={() => setSelectedStatus(filter.value)}
                className={`
                  px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${selectedStatus === filter.value
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {filter.label}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    selectedStatus === filter.value
                      ? 'bg-white bg-opacity-30'
                      : 'bg-gray-200'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading && orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
            <p className="mt-1 text-sm text-gray-500">
              {selectedStatus === 'ALL' 
                ? 'No orders yet. Orders will appear here when customers place them.'
                : `No ${selectedStatus.toLowerCase()} orders.`
              }
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              isNew={newOrderIds.has(order._id)}
              onStatusUpdate={handleStatusUpdate}
            />
          ))
        )}
      </div>

      {/* Real-time Indicator */}
      {!isLoading && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-sm text-gray-500">
            <span className="w-2 h-2 bg-[#22C55E] rounded-full mr-2 animate-pulse"></span>
            Live updates enabled
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
