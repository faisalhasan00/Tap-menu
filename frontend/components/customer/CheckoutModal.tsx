'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/orderService';
import Button from '@/components/ui/Button';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
  onOrderSuccess?: (orderData: {
    restaurantName: string;
    orderId: string;
    trackingId: string;
    trackingNumber?: string;
    tableNumber: number;
    items: Array<{ name: string; price: number; quantity: number }>;
    totalAmount: number;
    orderDate: string;
    estimatedTime: number;
  }) => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  tableNumber,
  onOrderSuccess,
}) => {
  const { items, totalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');


  const handleCheckout = async () => {
    console.log('🛒 [CHECKOUT] handleCheckout called', { itemsCount: items.length, items });

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      console.log('🛒 [CHECKOUT] Creating order:', {
        restaurantId,
        tableNumber,
        itemsCount: items.length
      });

      const orderData = {
        restaurantId,
        tableNumber,
        items: items.map((item) => ({
          menuItemId: item._id,
          quantity: item.quantity,
        })),
      };

      console.log('📦 [CHECKOUT] Order data prepared:', {
        ...orderData,
        items: orderData.items.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity }))
      });

      const response = await orderService.createOrder(orderData);

      console.log('✅ [CHECKOUT] Order created successfully:', response);
      console.log('✅ [CHECKOUT] Full response:', JSON.stringify(response, null, 2));
      console.log('✅ [CHECKOUT] Order data:', response.data);
      console.log('✅ [CHECKOUT] Tracking ID:', response.data?.trackingId);
      console.log('✅ [CHECKOUT] Order ID:', response.data?._id);

      // Ensure we have the order data
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }

      const orderId = response.data._id || '';
      const trackId = response.data?.trackingNumber || response.data?.trackingId || '';

      console.log('✅ [CHECKOUT] Setting state:', { orderId, trackId, trackingNumber: response.data?.trackingNumber });

      // Store order items and details for receipt
      const receiptItems = (response.data.items || []).map((item: any) => ({
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        quantity: item.quantity || 1
      }));

      console.log('✅ [CHECKOUT] Receipt items prepared:', receiptItems);

      // Prepare order success data
      const successData = {
        restaurantName,
        orderId,
        trackingId: response.data?.trackingNumber || trackId,
        trackingNumber: response.data?.trackingNumber || trackId,
        tableNumber,
        items: receiptItems,
        totalAmount: response.data.totalAmount || totalPrice,
        orderDate: response.data.createdAt || new Date().toISOString(),
        estimatedTime: response.data.estimatedTime || 15,
      };

      // Clear cart
      clearCart();

      // Reset processing state
      setIsProcessing(false);

      // IMPORTANT: Notify parent FIRST with order data
      // This ensures parent state is updated before modal closes
      if (onOrderSuccess) {
        onOrderSuccess(successData);
      }

      // Close the checkout modal
      // Parent will handle closing based on state updates
      onClose();

      console.log('✅ [CHECKOUT] Order created successfully:', {
        orderId,
        trackId,
        trackingNumber: response.data?.trackingNumber,
        receiptItemsCount: receiptItems.length,
        orderTotal: response.data.totalAmount || totalPrice
      });
    } catch (err: any) {
      console.error('❌ [CHECKOUT] Order creation failed:', err);
      console.error('❌ [CHECKOUT] Error details:', {
        message: err.message,
        stack: err.stack,
        error: err
      });
      setError(err.message || 'Failed to place order. Please try again.');
      setIsProcessing(false);
    }
    // Note: isProcessing is set to false in the Promise.resolve().then() callback after orderSuccess is set
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError('');
      onClose();
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Order Summary */}
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-gray-600">Restaurant</p>
              <p className="font-medium text-gray-900">{restaurantName}</p>
              <p className="text-sm text-gray-600 mt-1">Table Number</p>
              <p className="font-medium text-gray-900">Table {tableNumber}</p>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      ₹{item.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-xl font-bold text-[#22C55E]">₹{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Button
            onClick={handleCheckout}
            isLoading={isProcessing}
            disabled={isProcessing || items.length === 0}
            className="w-full"
            variant="primary"
          >
            {isProcessing ? 'Placing Order...' : 'Place Order'}
          </Button>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="w-full mt-2 py-2 px-4 text-gray-600 hover:bg-gray-50 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

