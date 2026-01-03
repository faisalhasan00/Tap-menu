import { apiRoutes } from '@/config/routes';

export interface CustomerCategory {
  _id: string;
  name: string;
  order: number;
}

export interface CustomerMenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  vegType: 'VEG' | 'NON_VEG';
  isAvailable: boolean;
  categoryId: {
    _id: string;
    name: string;
  };
}

export interface CustomerRestaurant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'ACTIVE' | 'BLOCKED';
}

class CustomerMenuService {
  async getRestaurantBySlug(slug: string): Promise<{ success: boolean; data: CustomerRestaurant }> {
    const response = await fetch(apiRoutes.restaurants.getBySlug(slug));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Restaurant not found');
    }

    return response.json();
  }

  async getCategories(restaurantId: string): Promise<{ success: boolean; data: CustomerCategory[] }> {
    const response = await fetch(apiRoutes.customerMenu.categories(restaurantId));

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  }

  async getMenuItems(restaurantId: string, categoryId?: string): Promise<{ success: boolean; data: CustomerMenuItem[] }> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);

    const url = `${apiRoutes.customerMenu.items(restaurantId)}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch menu items');
    }

    return response.json();
  }
}

export const customerMenuService = new CustomerMenuService();

