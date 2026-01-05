'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { orderService } from '@/services/orderService';
import { frontendRoutes } from '@/config/routes';
import Button from '@/components/ui/Button';
import OrderReceipt from './OrderReceipt';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: string;
  restaurantName: string;
  tableNumber: number;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  tableNumber,
}) => {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [trackingId, setTrackingId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [orderItems, setOrderItems] = useState<Array<{ name: string; price: number; quantity: number }>>([]);
  const [orderTotal, setOrderTotal] = useState<number>(0);
  const [orderDate, setOrderDate] = useState<string>('');
  const [renderKey, setRenderKey] = useState<number>(0);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔍 [CHECKOUT_MODAL] State changed:', {
      orderSuccess,
      trackingId,
      orderNumber,
      error,
      isProcessing
    });
  }, [orderSuccess, trackingId, orderNumber, error, isProcessing]);

  // Force re-render when orderSuccess changes
  useEffect(() => {
    if (orderSuccess) {
      console.log('🎉 [CHECKOUT_MODAL] Order success detected, forcing render');
    }
  }, [orderSuccess]);

  const handleCheckout = async () => {
    console.log('🛒 [CHECKOUT] handleCheckout called', { itemsCount: items.length, items });
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsProcessing(true);
    setError('');
    setOrderSuccess(false);

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
      const trackId = response.data?.trackingId || '';
      
      console.log('✅ [CHECKOUT] Setting state:', { orderId, trackId });
      
      // Store order items and details for receipt
      const receiptItems = (response.data.items || []).map((item: any) => ({
        name: item.name || 'Unknown Item',
        price: item.price || 0,
        quantity: item.quantity || 1
      }));
      
      console.log('✅ [CHECKOUT] Receipt items prepared:', receiptItems);
      
      // Set all states synchronously - React 18 will batch these
      setOrderNumber(orderId);
      setTrackingId(trackId);
      setOrderItems(receiptItems);
      setOrderTotal(response.data.totalAmount || totalPrice);
      setOrderDate(response.data.createdAt || new Date().toISOString());
      setIsProcessing(false);
      setOrderSuccess(true);
      setRenderKey(prev => prev + 1);
      
      clearCart();
      
      console.log('✅ [CHECKOUT] All states set synchronously:', {
        orderSuccess: true,
        orderId,
        trackId,
        receiptItemsCount: receiptItems.length,
        orderTotal: response.data.totalAmount || totalPrice
      });
      
      console.log('✅ [CHECKOUT] All states initialized:', {
        orderId,
        trackId,
        receiptItemsCount: receiptItems.length,
        orderTotal: response.data.totalAmount || totalPrice
      });
      
      console.log('✅ [CHECKOUT] States initialized:', {
        orderId,
        trackId,
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
      setOrderSuccess(false);
      setIsProcessing(false);
    }
    // Note: isProcessing is set to false in the Promise.resolve().then() callback after orderSuccess is set
  };

  const handleClose = () => {
    if (!isProcessing) {
      setError('');
      setOrderSuccess(false);
      setCopied(false);
      onClose();
    }
  };

  const handleCopyTrackingId = async () => {
    if (!trackingId) return;

    try {
      await navigator.clipboard.writeText(trackingId);
      setCopied(true);
      
      // Redirect to track order page after a short delay
      setTimeout(() => {
        onClose();
        router.push(`${frontendRoutes.customer.trackOrder}?id=${trackingId}`);
      }, 1000);
    } catch (err) {
      console.error('Failed to copy tracking ID:', err);
      // Fallback: redirect even if copy fails
      onClose();
      router.push(`${frontendRoutes.customer.trackOrder}?id=${trackingId}`);
    }
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOrderSuccess(false);
      setError('');
      setTrackingId('');
      setOrderNumber('');
      setOrderItems([]);
      setCopied(false);
      setRenderKey(0);
    }
  }, [isOpen]);

  // Log render state and force re-render if needed
  useEffect(() => {
    if (isOpen) {
      console.log('🔍 [CHECKOUT_MODAL] Render state:', {
        isOpen,
        orderSuccess,
        trackingId,
        orderNumber,
        error,
        isProcessing,
        orderItemsCount: orderItems.length,
        shouldShowSuccess: orderSuccess && isOpen && trackingId
      });
      
      // If we have success state but UI isn't showing, force a re-render
      if (orderSuccess && trackingId && orderItems.length === 0) {
        console.log('⚠️ [CHECKOUT_MODAL] Success state but no items - checking response data');
      }
    }
  }, [isOpen, orderSuccess, trackingId, orderNumber, error, isProcessing, orderItems.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div key={renderKey} className={`bg-white rounded-lg shadow-xl ${orderSuccess ? 'max-w-2xl' : 'max-w-md'} w-full max-h-[90vh] overflow-hidden flex flex-col z-[10000]`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {orderSuccess ? 'Order Placed!' : 'Checkout'}
          </h2>
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
          {(() => {
            console.log('🎨 [CHECKOUT_MODAL] Rendering content:', {
              orderSuccess,
              trackingId,
              orderItemsCount: orderItems.length,
              orderNumber,
              shouldShowSuccess: orderSuccess && trackingId
            });
            
            if (orderSuccess && trackingId) {
              return (
                <div className="space-y-4" key={`success-${trackingId}`}>
                  {/* Success Message */}
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-600 mb-2">
                      Your order has been sent to {restaurantName}
                    </p>
                    <p className="text-lg font-semibold text-[#22C55E] mb-2">
                      Your order will arrive in approximately 10 minutes
                    </p>
                    <div className="bg-[#22C55E] bg-opacity-10 border border-[#22C55E] rounded-lg p-3 mt-4">
                      <p className="text-sm text-gray-700 font-medium mb-1">Tracking ID:</p>
                      <p className="text-xl font-bold text-[#22C55E] tracking-wider">{trackingId}</p>
                    </div>
                  </div>

              {/* Order Receipt */}
              {orderItems.length > 0 ? (
                <OrderReceipt
                  restaurantName={restaurantName}
                  tableNumber={tableNumber}
                  trackingId={trackingId}
                  orderNumber={orderNumber}
                  items={orderItems}
                  totalAmount={orderTotal}
                  orderDate={orderDate}
                />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                  <p className="text-gray-600 mb-2">Order Receipt</p>
                  <p className="text-sm text-gray-500">Table: {tableNumber}</p>
                  <p className="text-sm text-gray-500">Total: ₹{orderTotal > 0 ? orderTotal.toFixed(2) : '0.00'}</p>
                  <p className="text-xs text-gray-400 mt-2">Receipt details loading...</p>
                </div>
              )}

                  {/* Track Order Link */}
                  <div className="text-center pt-4">
                    <button
                      onClick={handleCopyTrackingId}
                      className="text-[#22C55E] hover:text-[#16A34A] font-semibold underline text-sm"
                    >
                      {copied ? 'Redirecting to track page...' : 'Click here to track your order'}
                    </button>
                  </div>
                </div>
              );
            }
            
            if (orderSuccess && !trackingId) {
              return (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                Your order has been sent to {restaurantName}
              </p>
                <p className="text-sm text-gray-500">
                  Order ID: {orderNumber.substring(0, 8)}...
                </p>
              </div>
              );
            }
            
            // Default: Show checkout form
            return (
              <>
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
              </>
            );
          })()}
        </div>

        {/* Footer */}
        {!orderSuccess ? (
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
        ) : (
          <div className="border-t border-gray-200 p-4">
            <Button
              onClick={handleClose}
              className="w-full"
              variant="primary"
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;

