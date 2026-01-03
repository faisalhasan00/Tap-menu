'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Toast from '@/components/ui/Toast';
import AddRestaurantModal from '@/components/restaurants/AddRestaurantModal';
import CreateOwnerModal from '@/components/restaurants/CreateOwnerModal';
import { restaurantService, Restaurant } from '@/services/restaurantService';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [createOwnerModal, setCreateOwnerModal] = useState<{
    isOpen: boolean;
    restaurantId: string;
    restaurantName: string;
  }>({
    isOpen: false,
    restaurantId: '',
    restaurantName: '',
  });
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  const fetchRestaurants = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await restaurantService.getRestaurants();
      setRestaurants(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleBlock = async (id: string) => {
    try {
      setActionLoading(id);
      await restaurantService.blockRestaurant(id);
      await fetchRestaurants();
    } catch (err: any) {
      alert(err.message || 'Failed to block restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (id: string) => {
    try {
      setActionLoading(id);
      await restaurantService.unblockRestaurant(id);
      await fetchRestaurants();
    } catch (err: any) {
      alert(err.message || 'Failed to unblock restaurant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenCreateOwner = (restaurantId: string, restaurantName: string) => {
    setCreateOwnerModal({
      isOpen: true,
      restaurantId,
      restaurantName,
    });
  };

  const handleCreateOwnerSuccess = () => {
    setToast({
      isVisible: true,
      message: 'Restaurant owner created successfully!',
      type: 'success',
    });
    fetchRestaurants();
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurants</h1>
          <p className="text-gray-600">Manage all restaurants in the platform</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <span className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Restaurant
          </span>
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
            <p className="mt-4 text-gray-600">Loading restaurants...</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="p-12 text-center">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No restaurants</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new restaurant.</p>
            <div className="mt-6">
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                Add Restaurant
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Restaurant Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {restaurant.logo && (
                          <img
                            src={restaurant.logo}
                            alt={restaurant.name}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500">{restaurant.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={restaurant.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleOpenCreateOwner(restaurant._id, restaurant.name)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          Create Owner
                        </button>
                        {restaurant.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleBlock(restaurant._id)}
                            disabled={actionLoading === restaurant._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === restaurant._id ? 'Blocking...' : 'Block'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblock(restaurant._id)}
                            disabled={actionLoading === restaurant._id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {actionLoading === restaurant._id ? 'Unblocking...' : 'Unblock'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Restaurant Modal */}
      <AddRestaurantModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchRestaurants}
      />

      {/* Create Owner Modal */}
      <CreateOwnerModal
        isOpen={createOwnerModal.isOpen}
        onClose={() => setCreateOwnerModal({ isOpen: false, restaurantId: '', restaurantName: '' })}
        restaurantId={createOwnerModal.restaurantId}
        restaurantName={createOwnerModal.restaurantName}
        onSuccess={handleCreateOwnerSuccess}
      />

      {/* Success Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
