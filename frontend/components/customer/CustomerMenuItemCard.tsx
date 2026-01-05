'use client';

import { CustomerMenuItem } from '@/services/customerMenuService';
import { useCart } from '@/contexts/CartContext';

interface CustomerMenuItemCardProps {
  item: CustomerMenuItem;
}

const CustomerMenuItemCard: React.FC<CustomerMenuItemCardProps> = ({ item }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (!item.isAvailable) return;
    
    addToCart({
      _id: item._id,
      name: item.name,
      price: item.price,
      image: item.image,
      vegType: item.vegType,
    });
  };

  if (!item.isAvailable) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 opacity-60 relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">
            Unavailable
          </span>
        </div>
        <div className="flex gap-4">
          {item.image && (
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{item.name}</h3>
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  item.vegType === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {item.vegType === 'VEG' ? '🟢 VEG' : '🔴 NON-VEG'}
              </span>
            </div>
            <p className="text-lg font-bold text-gray-900">₹{item.price.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded flex-shrink-0 ml-2 ${
                item.vegType === 'VEG' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {item.vegType === 'VEG' ? '🟢 VEG' : '🔴 NON-VEG'}
            </span>
          </div>
          <p className="text-lg font-bold text-[#22C55E] mb-3">₹{item.price.toFixed(2)}</p>
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#22C55E] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#16A34A] transition-colors active:scale-95"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerMenuItemCard;


