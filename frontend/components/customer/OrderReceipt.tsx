'use client';

import { useRef } from 'react';

interface OrderReceiptProps {
  restaurantName: string;
  tableNumber: number;
  trackingId: string; // For backward compatibility
  trackingNumber?: string; // New format: DM-ORD-{number}
  orderNumber: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  orderDate: string;
  hideDownloadButtons?: boolean;
}

const OrderReceipt: React.FC<OrderReceiptProps> = ({
  restaurantName,
  tableNumber,
  trackingId,
  trackingNumber,
  orderNumber,
  items,
  totalAmount,
  orderDate,
  hideDownloadButtons = false,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const displayTrackingNumber = trackingNumber || trackingId;

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      // Dynamically import libraries
      const [html2canvas, jsPDF] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Create canvas from the receipt element
      const canvas = await html2canvas.default(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF
      const pdf = new jsPDF.default('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      pdf.save(`Order-${displayTrackingNumber}-${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current) return;

    try {
      // Dynamically import html2canvas
      const html2canvas = await import('html2canvas');
      
      const canvas = await html2canvas.default(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `Order-${displayTrackingNumber}-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to download receipt. Please try again.');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = 0; // You can add tax calculation here if needed
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      {/* Receipt Content */}
      <div
        ref={receiptRef}
        className="bg-white p-6 rounded-lg border-2 border-gray-200 max-w-md mx-auto"
        style={{ minWidth: '300px' }}
      >
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{restaurantName}</h2>
          <p className="text-sm text-gray-600">Order Receipt</p>
        </div>

        {/* Order Info */}
        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Table Number:</span>
            <span className="font-semibold text-gray-900">Table {tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tracking Number:</span>
            <span className="font-bold text-[#22C55E]">{displayTrackingNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order Date:</span>
            <span className="font-semibold text-gray-900">
              {new Date(orderDate).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Order ID:</span>
            <span className="font-semibold text-gray-900 text-xs">{orderNumber.substring(0, 12)}...</span>
          </div>
        </div>

        {/* Items */}
        <div className="border-t border-b border-gray-300 py-4 my-4">
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    ₹{item.price.toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 ml-4">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax:</span>
              <span className="font-semibold text-gray-900">₹{tax.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2 mt-2">
            <span className="text-gray-900">Total:</span>
            <span className="text-[#22C55E]">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-gray-300">
          <p className="text-xs text-gray-500 mb-2">Thank you for your order!</p>
          <p className="text-xs text-gray-500">
            Track your order using: <span className="font-semibold text-[#22C55E]">{displayTrackingNumber}</span>
          </p>
        </div>
      </div>

      {/* Download Buttons */}
      {!hideDownloadButtons && (
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderReceipt;

