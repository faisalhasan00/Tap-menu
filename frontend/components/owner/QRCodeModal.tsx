'use client';

import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  menuUrl: string;
  restaurantName: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  qrCodeUrl,
  menuUrl,
  restaurantName,
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${restaurantName}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Restaurant QR Code" size="md">
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Customers can scan this QR code to view your menu and place orders. They will be asked to select their table number before viewing the menu.
        </p>

        {/* QR Code Display */}
        <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
          <img
            src={qrCodeUrl}
            alt="Restaurant QR Code"
            className="w-64 h-64"
          />
        </div>

        {/* Menu URL */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Menu URL:</p>
          <p className="text-sm font-mono text-gray-900 break-all">{menuUrl}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Close
          </Button>
          <Button variant="primary" onClick={handleDownload} className="flex-1">
            Download QR Code
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default QRCodeModal;

