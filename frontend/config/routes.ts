/**
 * Routes Configuration
 * Centralized file for all API endpoints and frontend routes
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const FRONTEND_BASE_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

// API Routes
export const apiRoutes = {
  // Health Check
  health: {
    base: `${API_BASE_URL}/health`,
    get: `${API_BASE_URL}/health`
  },

  // Authentication
  auth: {
    base: `${API_BASE_URL}/auth`,
    login: `${API_BASE_URL}/auth/login`
  },

  // Restaurants
  restaurants: {
    base: `${API_BASE_URL}/restaurants`,
    create: `${API_BASE_URL}/restaurants`,
    getAll: `${API_BASE_URL}/restaurants`,
    getById: (id: string) => `${API_BASE_URL}/restaurants/${id}`,
    getBySlug: (slug: string) => `${API_BASE_URL}/restaurants/slug/${slug}`,
    getOwn: `${API_BASE_URL}/restaurants/me`,
    getQRCode: `${API_BASE_URL}/restaurants/me/qr-code`,
    block: (id: string) => `${API_BASE_URL}/restaurants/${id}/block`,
    unblock: (id: string) => `${API_BASE_URL}/restaurants/${id}/unblock`,
    createOwner: (id: string) => `${API_BASE_URL}/restaurants/${id}/create-owner`
  },

  // Categories
  categories: {
    base: `${API_BASE_URL}/categories`,
    create: `${API_BASE_URL}/categories`,
    getAll: `${API_BASE_URL}/categories`
  },

  // Menu Items
  menuItems: {
    base: `${API_BASE_URL}/menu-items`,
    create: `${API_BASE_URL}/menu-items`,
    getAll: `${API_BASE_URL}/menu-items`,
    toggle: (id: string) => `${API_BASE_URL}/menu-items/${id}/toggle`
  },

  // Orders
  orders: {
    base: `${API_BASE_URL}/orders`,
    create: `${API_BASE_URL}/orders`,
    getAll: `${API_BASE_URL}/orders`,
    updateStatus: (id: string) => `${API_BASE_URL}/orders/${id}/status`
  },

  // Analytics
  analytics: {
    base: `${API_BASE_URL}/analytics`,
    overview: `${API_BASE_URL}/analytics/overview`,
    monthlyReport: `${API_BASE_URL}/analytics/monthly-report`
  },

  // Dashboard
  dashboard: {
    base: `${API_BASE_URL}/dashboard`,
    stats: `${API_BASE_URL}/dashboard/stats`
  },

  // Customer Menu (Public)
  customerMenu: {
    base: `${API_BASE_URL}/customer/menu`,
    categories: (restaurantId: string) => `${API_BASE_URL}/customer/menu/${restaurantId}/categories`,
    items: (restaurantId: string) => `${API_BASE_URL}/customer/menu/${restaurantId}/items`
  },

  // Contact
  contact: {
    base: `${API_BASE_URL}/contact`,
    submit: `${API_BASE_URL}/contact`
  }
};

// Frontend Routes
export const frontendRoutes = {
  // Home
  home: '/',

  // Super Admin
  superAdmin: {
    login: '/super-admin/login',
    dashboard: '/super-admin/dashboard',
    restaurants: '/super-admin/dashboard/restaurants'
  },

  // Restaurant Owner
  owner: {
    login: '/owner/login',
    dashboard: '/owner/dashboard',
    menu: '/owner/dashboard/menu',
    orders: '/owner/dashboard/orders',
    analytics: '/owner/dashboard/analytics'
  },

  // Customer Menu (Public)
  customer: {
    menu: (restaurantSlug: string) => `/r/${restaurantSlug}`
  }
};

// Helper function to get full URL
export const getFullUrl = (path: string): string => {
  return `${FRONTEND_BASE_URL}${path}`;
};

// Export API base URL for direct use
export const API_URL = API_BASE_URL;
export const FRONTEND_URL = FRONTEND_BASE_URL;


