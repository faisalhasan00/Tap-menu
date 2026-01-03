import { apiRoutes } from '@/config/routes';

export interface Restaurant {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRestaurantData {
  name: string;
  slug: string;
  logo?: string;
}

class RestaurantService {
  // ✅ FIXED: Return type is now Record<string, string>
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');

    console.log('🔐 [FRONTEND] Getting auth headers:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
    });

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async getRestaurants(): Promise<{ success: boolean; data: Restaurant[]; count: number }> {
    const response = await fetch(apiRoutes.restaurants.getAll, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch restaurants');
    }

    return response.json();
  }

  async createRestaurant(
    data: CreateRestaurantData
  ): Promise<{ success: boolean; data: Restaurant }> {
    console.log('🍽️ [FRONTEND] Creating restaurant:', data);
    console.log('🍽️ [FRONTEND] API URL:', apiRoutes.restaurants.create);

    const headers = this.getAuthHeaders();

    console.log('🍽️ [FRONTEND] Request headers:', {
      hasContentType: !!headers['Content-Type'],
      hasAuthorization: !!headers['Authorization'],
      authHeaderPrefix: headers['Authorization']?.substring(0, 20) + '...',
    });

    const response = await fetch(apiRoutes.restaurants.create, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    console.log('🍽️ [FRONTEND] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [FRONTEND] Create restaurant failed:', error);
      throw new Error(error.message || 'Failed to create restaurant');
    }

    const result = await response.json();
    console.log('✅ [FRONTEND] Restaurant created successfully');
    return result;
  }

  async blockRestaurant(id: string): Promise<{ success: boolean; data: Restaurant }> {
    const response = await fetch(apiRoutes.restaurants.block(id), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to block restaurant');
    }

    return response.json();
  }

  async unblockRestaurant(id: string): Promise<{ success: boolean; data: Restaurant }> {
    const response = await fetch(apiRoutes.restaurants.unblock(id), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unblock restaurant');
    }

    return response.json();
  }

  async createOwner(
    restaurantId: string,
    data: { username: string; password: string }
  ): Promise<{ success: boolean; data: any }> {
    const response = await fetch(apiRoutes.restaurants.createOwner(restaurantId), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create restaurant owner');
    }

    return response.json();
  }

  async getOwnRestaurant(): Promise<{ success: boolean; data: Restaurant }> {
    const response = await fetch(apiRoutes.restaurants.getOwn, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch restaurant');
    }

    return response.json();
  }

  async getQRCode(): Promise<{
    success: boolean;
    data: { qrCodeUrl: string; menuUrl: string; restaurant: Restaurant };
  }> {
    const response = await fetch(apiRoutes.restaurants.getQRCode, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate QR code');
    }

    return response.json();
  }
}

export const restaurantService = new RestaurantService();
