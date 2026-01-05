import { apiRoutes } from '@/config/routes';

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  restaurantId: string | {
    _id: string;
    name: string;
    slug: string;
  };
  tableNumber: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'READY';
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  restaurantId: string;
  tableNumber: number;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
}

class OrderService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getOrders(status?: string, tableNumber?: number): Promise<{ success: boolean; data: Order[]; count: number }> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (tableNumber) params.append('tableNumber', tableNumber.toString());

    const url = `${apiRoutes.orders.getAll}?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch orders');
    }

    return response.json();
  }

  async createOrder(data: CreateOrderData): Promise<{ success: boolean; data: Order }> {
    console.log('📤 [ORDER_SERVICE] Sending order data:', data);
    
    const response = await fetch(apiRoutes.orders.create, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('📥 [ORDER_SERVICE] Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ [ORDER_SERVICE] Error response:', error);
      
      // Combine message and errors array if present
      let errorMessage = error.message || 'Failed to create order';
      if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
        errorMessage += ': ' + error.errors.join(', ');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log('✅ [ORDER_SERVICE] Order created:', result);
    console.log('✅ [ORDER_SERVICE] Full order data:', result.data);
    console.log('✅ [ORDER_SERVICE] Tracking ID from response:', result.data?.trackingId);
    return result;
  }

  async updateOrderStatus(orderId: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'READY'): Promise<{ success: boolean; data: Order }> {
    const response = await fetch(apiRoutes.orders.updateStatus(orderId), {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update order status');
    }

    return response.json();
  }

  async getOrderByTrackingId(trackingId: string): Promise<{ success: boolean; data: Order }> {
    const response = await fetch(apiRoutes.orders.track(trackingId), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Order not found');
    }

    return response.json();
  }
}

export const orderService = new OrderService();

