import { apiRoutes } from '@/config/routes';

export interface Category {
  _id: string;
  name: string;
  restaurantId: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  image?: string;
  vegType: 'VEG' | 'NON_VEG';
  isAvailable: boolean;
  categoryId: {
    _id: string;
    name: string;
    order?: number;
  } | string;
  restaurantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  order?: number;
}

export interface CreateMenuItemData {
  name: string;
  price: number;
  categoryId: string;
  image?: string;
  vegType?: 'VEG' | 'NON_VEG';
  isAvailable?: boolean;
}

class MenuService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Categories
  async getCategories(): Promise<{ success: boolean; data: Category[]; count: number }> {
    const response = await fetch(apiRoutes.categories.getAll, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch categories');
    }

    return response.json();
  }

  async createCategory(data: CreateCategoryData): Promise<{ success: boolean; data: Category }> {
    const response = await fetch(apiRoutes.categories.create, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create category');
    }

    return response.json();
  }

  // Menu Items
  async getMenuItems(categoryId?: string, isAvailable?: boolean): Promise<{ success: boolean; data: MenuItem[]; count: number }> {
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (isAvailable !== undefined) params.append('isAvailable', isAvailable.toString());

    const url = `${apiRoutes.menuItems.getAll}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch menu items');
    }

    return response.json();
  }

  async createMenuItem(data: CreateMenuItemData): Promise<{ success: boolean; data: MenuItem }> {
    const response = await fetch(apiRoutes.menuItems.create, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create menu item');
    }

    return response.json();
  }

  async toggleMenuItemAvailability(id: string): Promise<{ success: boolean; data: MenuItem }> {
    const response = await fetch(apiRoutes.menuItems.toggle(id), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle menu item availability');
    }

    return response.json();
  }
}

export const menuService = new MenuService();

