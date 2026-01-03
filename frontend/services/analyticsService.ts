import { apiRoutes } from '@/config/routes';

export interface AnalyticsData {
  today: {
    totalOrdersToday: number;
    totalSalesToday: number;
    yesterdaySales: number;
    salesDifferencePercentage: number;
  };
  monthly: {
    totalOrdersThisMonth: number;
    totalSalesThisMonth: number;
  };
  mostSoldDish: {
    dishName: string | null;
    quantitySold: number;
  };
  peakTime: {
    hour: number | null;
    orderCount: number;
  };
  peakDay: {
    weekday: string | null;
    orderCount: number;
  };
}

class AnalyticsService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async getOverview(): Promise<{ success: boolean; data: AnalyticsData }> {
    const response = await fetch(apiRoutes.analytics.overview, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch analytics');
    }

    return response.json();
  }

  async downloadMonthlyReport(): Promise<void> {
    const token = localStorage.getItem('token');
    const response = await fetch(apiRoutes.analytics.monthlyReport, {
      method: 'GET',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to download monthly report');
    }

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'monthly-report.pdf';
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }

    // Convert response to blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const analyticsService = new AnalyticsService();

