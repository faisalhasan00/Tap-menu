'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Toast from '@/components/ui/Toast';
import AddCategoryModal from '@/components/menu/AddCategoryModal';
import AddMenuItemModal from '@/components/menu/AddMenuItemModal';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { menuService, Category, MenuItem } from '@/services/menuService';

export default function MenuManagementPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isVisible: false,
    message: '',
    type: 'success',
  });

  const fetchCategories = async () => {
    try {
      const response = await menuService.getCategories();
      setCategories(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    }
  };

  const fetchMenuItems = async () => {
    try {
      const categoryId = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await menuService.getMenuItems(categoryId);
      setMenuItems(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load menu items');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError('');
      await Promise.all([fetchCategories(), fetchMenuItems()]);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategory]);

  const handleCategorySuccess = () => {
    fetchCategories();
    setToast({
      isVisible: true,
      message: 'Category created successfully!',
      type: 'success',
    });
  };

  const handleMenuItemSuccess = () => {
    fetchMenuItems();
    setToast({
      isVisible: true,
      message: 'Menu item created successfully!',
      type: 'success',
    });
  };

  const handleToggleItem = () => {
    fetchMenuItems();
  };

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => {
          const categoryId = typeof item.categoryId === 'object' ? item.categoryId._id : item.categoryId;
          return categoryId === selectedCategory;
        });

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Menu Management</h1>
        <p className="text-gray-600">Manage your restaurant menu items and categories</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
          <Button variant="primary" onClick={() => setIsCategoryModalOpen(true)}>
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Category
            </span>
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No categories yet. Create your first category!</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Items
            </button>
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => setSelectedCategory(category._id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category._id
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu Items Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Menu Items {selectedCategory !== 'all' && `(${filteredItems.length})`}
          </h2>
          <Button
            variant="primary"
            onClick={() => setIsMenuItemModalOpen(true)}
            disabled={categories.length === 0}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Menu Item
            </span>
          </Button>
        </div>

        {categories.length === 0 ? (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
            <p className="mt-1 text-sm text-gray-500">Create a category first to add menu items.</p>
          </div>
        ) : filteredItems.length === 0 ? (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No menu items</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new menu item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <MenuItemCard key={item._id} item={item} onToggle={handleToggleItem} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSuccess={handleCategorySuccess}
      />

      <AddMenuItemModal
        isOpen={isMenuItemModalOpen}
        onClose={() => setIsMenuItemModalOpen(false)}
        categories={categories}
        onSuccess={handleMenuItemSuccess}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
