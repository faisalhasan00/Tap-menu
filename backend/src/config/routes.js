/**
 * API Routes Configuration
 * Centralized file for all API route paths
 */

const API_BASE = '/api';

const routes = {
  // Health Check
  health: {
    base: `${API_BASE}/health`,
    get: `${API_BASE}/health`
  },

  // Authentication
  auth: {
    base: `${API_BASE}/auth`,
    login: `${API_BASE}/auth/login`
  },

  // Restaurants
  restaurants: {
    base: `${API_BASE}/restaurants`,
    create: `${API_BASE}/restaurants`,
    getAll: `${API_BASE}/restaurants`,
    getById: (id) => `${API_BASE}/restaurants/${id}`,
    getBySlug: (slug) => `${API_BASE}/restaurants/slug/${slug}`,
    getOwn: `${API_BASE}/restaurants/me`,
    block: (id) => `${API_BASE}/restaurants/${id}/block`,
    unblock: (id) => `${API_BASE}/restaurants/${id}/unblock`,
    createOwner: (id) => `${API_BASE}/restaurants/${id}/create-owner`
  },

  // Categories
  categories: {
    base: `${API_BASE}/categories`,
    create: `${API_BASE}/categories`,
    getAll: `${API_BASE}/categories`
  },

  // Menu Items
  menuItems: {
    base: `${API_BASE}/menu-items`,
    create: `${API_BASE}/menu-items`,
    getAll: `${API_BASE}/menu-items`,
    toggle: (id) => `${API_BASE}/menu-items/${id}/toggle`
  },

  // Orders
  orders: {
    base: `${API_BASE}/orders`,
    create: `${API_BASE}/orders`,
    getAll: `${API_BASE}/orders`,
    updateStatus: (id) => `${API_BASE}/orders/${id}/status`
  },

  // Analytics
  analytics: {
    base: `${API_BASE}/analytics`,
    overview: `${API_BASE}/analytics/overview`
  },

  // Customer Menu (Public)
  customerMenu: {
    base: `${API_BASE}/customer/menu`,
    categories: (restaurantId) => `${API_BASE}/customer/menu/${restaurantId}/categories`,
    items: (restaurantId) => `${API_BASE}/customer/menu/${restaurantId}/items`
  },

  // Contact
  contact: {
    base: `${API_BASE}/contact`,
    submit: `${API_BASE}/contact`
  }
};

module.exports = routes;


