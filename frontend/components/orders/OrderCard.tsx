'use client';

import { useState } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Order } from '@/services/orderService';
import { orderService } from '@/services/orderService';

interface OrderCardProps {
  order: Order;
  isNew?: boolean;
  onStatusUpdate: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, isNew = false, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (newStatus: 'ACCEPTED' | 'REJECTED' | 'READY') => {
    setIsUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, newStatus);
      onStatusUpdate();
    } catch (error: any) {
      alert(error.message || 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusActions = () => {
    switch (order.status) {
      case 'PENDING':
        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusUpdate('ACCEPTED')}
              isLoading={isUpdating}
            >
              Accept
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleStatusUpdate('REJECTED')}
              isLoading={isUpdating}
            >
              Reject
            </Button>
          </div>
        );
      case 'ACCEPTED':
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleStatusUpdate('READY')}
            isLoading={isUpdating}
          >
            Mark as Ready
          </Button>
        );
      case 'READY':
      case 'REJECTED':
        return (
          <span className="text-sm text-gray-500">No actions available</span>
        );
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={`
        bg-white rounded-lg shadow-md p-6 border-l-4 transition-all duration-200
        ${isNew ? 'border-[#22C55E] animate-pulse' : 'border-transparent'}
        ${order.status === 'PENDING' ? 'hover:shadow-lg' : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">Table {order.tableNumber}</h3>
            {isNew && (
              <span className="px-2 py-0.5 bg-[#22C55E] text-white text-xs font-semibold rounded-full animate-bounce">
                NEW
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{formatTime(order.createdAt)}</p>
        </div>
        <Badge status={order.status} />
      </div>

      {/* Order Items */}
      <div className="mb-4 space-y-2">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {item.quantity}x {item.name}
              </p>
            </div>
            <p className="text-sm text-gray-600">₹{(item.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div>
          <p className="text-xs text-gray-500">Total Amount</p>
          <p className="text-xl font-bold text-[#22C55E]">₹{order.totalAmount.toFixed(2)}</p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusActions()}
        </div>
      </div>
    </div>
  );
};

export default OrderCard;


