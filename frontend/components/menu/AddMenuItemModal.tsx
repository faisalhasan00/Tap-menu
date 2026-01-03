'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { menuService, CreateMenuItemData, Category } from '@/services/menuService';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess: () => void;
}

const AddMenuItemModal: React.FC<AddMenuItemModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<CreateMenuItemData>({
    name: '',
    price: 0,
    categoryId: '',
    image: '',
    vegType: 'VEG',
    isAvailable: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (categories.length > 0 && !formData.categoryId) {
      setFormData((prev) => ({ ...prev, categoryId: categories[0]._id }));
    }
  }, [categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'price'
          ? parseFloat(value) || 0
          : name === 'isAvailable'
          ? (e.target as HTMLInputElement).checked
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Valid price is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      await menuService.createMenuItem({
        name: formData.name.trim(),
        price: formData.price,
        categoryId: formData.categoryId,
        image: formData.image?.trim() || undefined,
        vegType: formData.vegType,
        isAvailable: formData.isAvailable,
      });

      setFormData({
        name: '',
        price: 0,
        categoryId: categories[0]?._id || '',
        image: '',
        vegType: 'VEG',
        isAvailable: true,
      });
      setErrors({});
      onSuccess();
      onClose();
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create menu item' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        name: '',
        price: 0,
        categoryId: categories[0]?._id || '',
        image: '',
        vegType: 'VEG',
        isAvailable: true,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Menu Item" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Item Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Caesar Salad"
            error={errors.name}
            required
          />

          <Input
            label="Price"
            type="number"
            name="price"
            value={formData.price || ''}
            onChange={handleChange}
            placeholder="0.00"
            error={errors.price}
            step="0.01"
            min="0"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent
              transition-all duration-200
              ${errors.categoryId ? 'border-red-500' : 'border-gray-300'}
            `}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
          )}
        </div>

        <Input
          label="Image URL (Optional)"
          type="url"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          error={errors.image}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veg Type
            </label>
            <select
              name="vegType"
              value={formData.vegType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
            >
              <option value="VEG">Vegetarian</option>
              <option value="NON_VEG">Non-Vegetarian</option>
            </select>
          </div>

          <div className="flex items-center pt-8">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="w-4 h-4 text-[#22C55E] border-gray-300 rounded focus:ring-[#22C55E]"
              />
              <span className="text-sm font-medium text-gray-700">Available</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Menu Item
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMenuItemModal;

