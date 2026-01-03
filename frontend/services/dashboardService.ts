import { apiRoutes } from '@/config/routes';

export interface DashboardStats {
  totalMenuItems: number;
  todayOrders: number;
  pendingOrders: number;
}

class DashboardService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getStats(): Promise<{ success: boolean; data: DashboardStats }> {
    const response = await fetch(apiRoutes.dashboard.stats, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch dashboard stats');
    }

    return response.json();
  }

  async getPendingOrdersCount(): Promise<number> {
    try {
      const stats = await this.getStats();
      return stats.data.pendingOrders;
    } catch (error) {
      console.error('Failed to fetch pending orders count:', error);
      return 0;
    }
  }
}

export const dashboardService = new DashboardService();


