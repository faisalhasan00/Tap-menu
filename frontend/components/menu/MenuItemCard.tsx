'use client';

import { useState } from 'react';
import { MenuItem } from '@/services/menuService';
import { menuService } from '@/services/menuService';

interface MenuItemCardProps {
  item: MenuItem;
  onToggle: () => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onToggle }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await menuService.toggleMenuItemAvailability(item._id);
      onToggle();
    } catch (error: any) {
      alert(error.message || 'Failed to toggle availability');
    } finally {
      setIsToggling(false);
    }
  };

  const categoryName = typeof item.categoryId === 'object' ? item.categoryId.name : 'Category';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        {/* Veg/Non-Veg Indicator */}
        <div className="absolute top-2 right-2">
          <div
            className={`px-2 py-1 rounded-full text-xs font-semibold ${
              item.vegType === 'VEG'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {item.vegType === 'VEG' ? '🟢 VEG' : '🔴 NON-VEG'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.name}</h3>
          <p className="text-sm text-gray-500">{categoryName}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-gray-900">${item.price.toFixed(2)}</span>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${item.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>
              {item.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
                ${item.isAvailable ? 'bg-[#22C55E]' : 'bg-gray-300'}
                ${isToggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:ring-offset-2
              `}
              role="switch"
              aria-checked={item.isAvailable}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;


