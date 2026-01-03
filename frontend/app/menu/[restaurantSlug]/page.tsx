'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { CartProvider } from '@/contexts/CartContext';
import CategoryTabs from '@/components/customer/CategoryTabs';
import CustomerMenuItemCard from '@/components/customer/CustomerMenuItemCard';
import CartBar from '@/components/customer/CartBar';
import { customerMenuService, CustomerCategory, CustomerMenuItem, CustomerRestaurant } from '@/services/customerMenuService';

function MenuContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const restaurantSlug = params.restaurantSlug as string;
  const tableNumber = searchParams.get('table') ? parseInt(searchParams.get('table')!) : undefined;
  
  const [restaurant, setRestaurant] = useState<CustomerRestaurant | null>(null);
  const [categories, setCategories] = useState<CustomerCategory[]>([]);
  const [menuItems, setMenuItems] = useState<CustomerMenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Load restaurant
        const restaurantRes = await customerMenuService.getRestaurantBySlug(restaurantSlug);
        setRestaurant(restaurantRes.data);

        if (restaurantRes.data.status === 'BLOCKED') {
          setError('This restaurant is currently unavailable');
          setIsLoading(false);
          return;
        }

        // Load categories and menu items
        const [categoriesRes, itemsRes] = await Promise.all([
          customerMenuService.getCategories(restaurantRes.data._id),
          customerMenuService.getMenuItems(restaurantRes.data._id),
        ]);

        setCategories(categoriesRes.data);
        setMenuItems(itemsRes.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load menu');
      } finally {
        setIsLoading(false);
      }
    };

    if (restaurantSlug) {
      loadMenu();
    }
  }, [restaurantSlug]);

  useEffect(() => {
    const loadItems = async () => {
      if (!restaurant) return;

      try {
        const response = await customerMenuService.getMenuItems(
          restaurant._id,
          selectedCategory || undefined
        );
        setMenuItems(response.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load menu items');
      }
    };

    loadItems();
  }, [selectedCategory, restaurant]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const filteredItems = selectedCategory
    ? menuItems.filter((item) => {
        const categoryId = typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;
        return categoryId === selectedCategory;
      })
    : menuItems;

  const availableItems = filteredItems.filter((item) => item.isAvailable);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          {restaurant?.logo && (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              className="h-12 mx-auto mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <h1 className="text-2xl font-bold text-gray-900 text-center">{restaurant?.name}</h1>
        </div>
      </header>

      {/* Category Tabs */}
      {categories.length > 0 && (
        <CategoryTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      )}

      {/* Menu Items */}
      <main className="px-4 py-6">
        {availableItems.length === 0 ? (
          <div className="text-center py-12">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for menu items.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableItems.map((item) => (
              <CustomerMenuItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Sticky Cart Bar */}
      <CartBar 
        restaurantId={restaurant?._id}
        restaurantName={restaurant?.name}
        tableNumber={tableNumber}
      />
    </div>
  );
}

export default function MenuPage() {
  return (
    <CartProvider>
      <MenuContent />
    </CartProvider>
  );
}

