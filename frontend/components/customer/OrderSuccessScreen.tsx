'use client';

import { useRouter } from 'next/navigation';
import { frontendRoutes } from '@/config/routes';
import Button from '@/components/ui/Button';
import OrderReceipt from './OrderReceipt';
import { generateInvoice } from '@/utils/invoiceGenerator';

interface OrderSuccessScreenProps {
  restaurantName: string;
  orderId: string;
  trackingId: string;
  trackingNumber?: string;
  tableNumber: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  totalAmount: number;
  orderDate: string;
  estimatedTime: number;
  onClose: () => void;
}

const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  restaurantName,
  orderId,
  trackingId,
  trackingNumber,
  tableNumber,
  items,
  totalAmount,
  orderDate,
  estimatedTime,
  onClose,
}) => {
  const router = useRouter();
  const displayTrackingNumber = trackingNumber || trackingId;

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

  const handleTrackOrder = () => {
    if (displayTrackingNumber) {
      router.push(frontendRoutes.customer.track(displayTrackingNumber));
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      await generateInvoice({
        restaurantName,
        orderId,
        trackingNumber: displayTrackingNumber,
        orderDate,
        tableNumber,
        items,
        totalAmount,
      });
    } catch (error: any) {
      console.error('Error downloading invoice:', error);
      alert(error.message || 'Failed to download invoice. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col z-[10000]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Order Placed Successfully!</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Success Message */}
          <div className="text-center mb-6">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-lg text-gray-600 mb-2">
              Your order has been sent to {restaurantName}
            </p>
            <p className="text-lg font-semibold text-[#22C55E] mb-4">
              Estimated preparation time: {formatEstimatedTime(estimatedTime)}
            </p>
            
            {/* Tracking Information */}
            {displayTrackingNumber && (
              <div className="bg-[#22C55E] bg-opacity-10 border-2 border-[#22C55E] rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">Tracking Number</p>
                <p className="text-2xl font-bold text-[#22C55E] tracking-wider mb-2">{displayTrackingNumber}</p>
                {trackingId && trackingId !== displayTrackingNumber && (
                  <p className="text-xs text-gray-600">Tracking ID: {trackingId}</p>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <Button
              onClick={handleTrackOrder}
              variant="primary"
              className="flex-1"
              size="lg"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Track Order
              </span>
            </Button>

            <Button
              onClick={handleDownloadInvoice}
              variant="secondary"
              className="flex-1"
              size="lg"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </span>
            </Button>
          </div>

          {/* Order Receipt */}
          <div className="border-t border-gray-200 pt-6">
            <OrderReceipt
              restaurantName={restaurantName}
              tableNumber={tableNumber}
              trackingId={trackingId}
              trackingNumber={trackingNumber}
              orderNumber={orderId}
              items={items}
              totalAmount={totalAmount}
              orderDate={orderDate}
              hideDownloadButtons={true}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <Button
            onClick={onClose}
            className="w-full"
            variant="primary"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessScreen;
