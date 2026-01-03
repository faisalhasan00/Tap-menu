'use client';

import { useState, useEffect } from 'react';
import RestaurantOwnerLayout from '@/components/layouts/RestaurantOwnerLayout';
import { restaurantService } from '@/services/restaurantService';

export default function OwnerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [restaurantName, setRestaurantName] = useState('Restaurant');
  const [restaurantStatus, setRestaurantStatus] = useState<'ACTIVE' | 'BLOCKED'>('ACTIVE');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await restaurantService.getOwnRestaurant();
        if (response.data) {
          setRestaurantName(response.data.name);
          setRestaurantStatus(response.data.status);
        }
      } catch (error) {
        console.error('Failed to fetch restaurant:', error);
        // Fallback to default values
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurant();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <RestaurantOwnerLayout restaurantName={restaurantName} restaurantStatus={restaurantStatus}>
      {children}
    </RestaurantOwnerLayout>
  );
}

