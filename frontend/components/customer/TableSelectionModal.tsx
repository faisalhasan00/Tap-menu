'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface TableSelectionModalProps {
  isOpen: boolean;
  restaurantName: string;
  onTableSelected: (tableNumber: number) => void;
}

const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
  isOpen,
  restaurantName,
  onTableSelected,
}) => {
  const [tableNumber, setTableNumber] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const tableNum = parseInt(tableNumber);
    
    if (!tableNumber || isNaN(tableNum) || tableNum < 1) {
      setError('Please enter a valid table number (1 or higher)');
      return;
    }

    onTableSelected(tableNum);
    setTableNumber('');
  };

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Select Your Table" size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">
          Welcome to <span className="font-semibold">{restaurantName}</span>!
        </p>
        <p className="text-sm text-gray-500">
          Please enter your table number to view the menu and place an order.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Table Number"
            type="number"
            name="tableNumber"
            value={tableNumber}
            onChange={(e) => {
              setTableNumber(e.target.value);
              setError('');
            }}
            placeholder="Enter table number"
            required
            min="1"
            autoFocus
          />

          <Button type="submit" variant="primary" className="w-full">
            Continue to Menu
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default TableSelectionModal;

