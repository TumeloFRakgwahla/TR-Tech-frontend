/**
 * TR-Tech Backend API Service
 *
 * This service handles all API calls to the TR-Tech backend.
 * Update the API_BASE_URL to point to your backend server.
 *
 * Domain-specific APIs are split into src/services/domains/.
 * Shared utilities are in src/services/shared.js.
 */

import { API_BASE_URL } from '../constants';

import { productsAPI } from './domains/products';
import { ordersAPI } from './domains/orders';
import { authAPI } from './domains/auth';

import {
  fetchWithTimeout,
  getCsrfToken,
  clearCsrfCache,
  apiRequest,
  handleResponse,
  createCrudAPI,
} from './shared';

// Re-export domain APIs for backward compatibility
export { productsAPI } from './domains/products';
export { ordersAPI } from './domains/orders';
export { authAPI } from './domains/auth';

// Re-export shared utilities for backward compatibility
export {
  fetchWithTimeout,
  getCsrfToken,
  clearCsrfCache,
  apiRequest,
  handleResponse,
  createCrudAPI,
};

/**
 * Services API
 */
export const servicesAPI = createCrudAPI('services', { withSignal: true });

/**
 * Contact API
 */
export const contactAPI = {
  submit: async (formData) => {
    return apiRequest(`${API_BASE_URL}/contact`, {
      method: 'POST',
      body: formData,
    });
  },

  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/contact`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Repairs API
 */
export const repairsAPI = {
  ...createCrudAPI('repairs'),

  myRepairs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs/my-repairs${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Notifications API
 */
export const notificationsAPI = {
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getUnreadCount: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/notifications/unread-count`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  markAsRead: async (id) => {
    return apiRequest(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async () => {
    return apiRequest(`${API_BASE_URL}/notifications/read-all`, {
      method: 'PUT',
    });
  },

  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  send: async (notificationData) => {
    return apiRequest(`${API_BASE_URL}/notifications/send`, {
      method: 'POST',
      body: notificationData,
    });
  },
};

/**
 * Health Check
 */
export const healthCheck = async () => {
  const baseUrl = API_BASE_URL.replace(/\/v1\/?$/, '');
  const response = await fetchWithTimeout(`${baseUrl}/health`);
  return handleResponse(response);
};

/**
 * Upload API
 */
export const uploadAPI = {
  uploadImage: async (file) => {
    return apiRequest(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
    }, true, () => {
      const fd = new FormData();
      fd.append('image', file);
      return fd;
    });
  },

  uploadImages: async (files) => {
    return apiRequest(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
    }, true, () => {
      const fd = new FormData();
      files.forEach((file) => fd.append('images', file));
      return fd;
    });
  },

  deleteImage: async (filename) => {
    return apiRequest(`${API_BASE_URL}/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Users API
 */
export const usersAPI = {
  ...createCrudAPI('users'),

  resetPassword: async (id, password) => {
    return apiRequest(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PUT',
      body: { password },
    });
  },

  getRoles: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/roles`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createRole: async (roleData) => {
    return apiRequest(`${API_BASE_URL}/users/roles`, {
      method: 'POST',
      body: roleData,
    });
  },

  updateRole: async (id, roleData) => {
    return apiRequest(`${API_BASE_URL}/users/roles/${id}`, {
      method: 'PUT',
      body: roleData,
    });
  },

  deleteRole: async (id) => {
    return apiRequest(`${API_BASE_URL}/users/roles/${id}`, {
      method: 'DELETE',
    });
  },

  getActivityLogs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/activity-logs${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getAdmins: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/admins`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateUserRole: async (id, role) => {
    return apiRequest(`${API_BASE_URL}/users/${id}/role`, {
      method: 'PUT',
      body: { role },
    });
  },

  toggleUserStatus: async (id, isActive) => {
    return apiRequest(`${API_BASE_URL}/users/${id}/status`, {
      method: 'PUT',
      body: { isActive },
    });
  },
};

/**
 * Marketing API
 */
export const marketingAPI = {
  getCoupons: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/coupons${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  createCoupon: async (couponData) => {
    return apiRequest(`${API_BASE_URL}/marketing/coupons`, {
      method: 'POST',
      body: couponData,
    });
  },

  updateCoupon: async (id, couponData) => {
    return apiRequest(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'PUT',
      body: couponData,
    });
  },

  deleteCoupon: async (id) => {
    return apiRequest(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'DELETE',
    });
  },

  validateCoupon: async (code, cartTotal, products = [], categories = []) => {
    const queryString = new URLSearchParams({
      code,
      cartTotal: String(cartTotal),
      products: JSON.stringify(products),
      categories: JSON.stringify(categories),
    }).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/coupons/validate?${queryString}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getCampaigns: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/campaigns${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  createCampaign: async (campaignData) => {
    return apiRequest(`${API_BASE_URL}/marketing/campaigns`, {
      method: 'POST',
      body: campaignData,
    });
  },

  updateCampaign: async (id, campaignData) => {
    return apiRequest(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: campaignData,
    });
  },

  deleteCampaign: async (id) => {
    return apiRequest(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  getPromotions: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/promotions${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  createPromotion: async (promotionData) => {
    return apiRequest(`${API_BASE_URL}/marketing/promotions`, {
      method: 'POST',
      body: promotionData,
    });
  },

  updatePromotion: async (id, promotionData) => {
    return apiRequest(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'PUT',
      body: promotionData,
    });
  },

  deletePromotion: async (id) => {
    return apiRequest(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Wishlist API
 */
export const wishlistAPI = {
  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (productId) => {
    return apiRequest(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
    });
  },

  remove: async (productId) => {
    return apiRequest(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
    });
  },

  check: async (productId) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist/check/${productId}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Cart API
 */
export const cartAPI = {
  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (itemData) => {
    return apiRequest(`${API_BASE_URL}/cart`, {
      method: 'POST',
      body: itemData,
    });
  },

  update: async (productId, quantity) => {
    return apiRequest(`${API_BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      body: { quantity },
    });
  },

  remove: async (productId) => {
    return apiRequest(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
    });
  },

  clear: async () => {
    return apiRequest(`${API_BASE_URL}/cart`, {
      method: 'DELETE',
    });
  },
};

/**
 * Account API
 */
export const accountAPI = {
  getProfile: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/profile`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    return apiRequest(`${API_BASE_URL}/account/profile`, {
      method: 'PUT',
      body: profileData,
    });
  },

  changePassword: async (passwordData) => {
    return apiRequest(`${API_BASE_URL}/account/password`, {
      method: 'PUT',
      body: passwordData,
    });
  },

  getAddresses: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createAddress: async (addressData) => {
    return apiRequest(`${API_BASE_URL}/account/addresses`, {
      method: 'POST',
      body: addressData,
    });
  },

  updateAddress: async (id, addressData) => {
    return apiRequest(`${API_BASE_URL}/account/addresses/${id}`, {
      method: 'PUT',
      body: addressData,
    });
  },

  deleteAddress: async (id) => {
    return apiRequest(`${API_BASE_URL}/account/addresses/${id}`, {
      method: 'DELETE',
    });
  },

  setDefaultAddress: async (id) => {
    return apiRequest(`${API_BASE_URL}/account/addresses/${id}/default`, {
      method: 'POST',
    });
  },

  getNotifications: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/notifications`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateNotifications: async (prefs) => {
    return apiRequest(`${API_BASE_URL}/account/notifications`, {
      method: 'PUT',
      body: prefs,
    });
  },

  getSessions: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/sessions`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  revokeSession: async (id) => {
    return apiRequest(`${API_BASE_URL}/account/sessions/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Payment Methods API
 */
export const paymentMethodsAPI = {
  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment-methods`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (data) => {
    return apiRequest(`${API_BASE_URL}/payment-methods`, {
      method: 'POST',
      body: data,
    });
  },

  setDefault: async (id) => {
    return apiRequest(`${API_BASE_URL}/payment-methods/${id}/default`, {
      method: 'POST',
    });
  },

  remove: async (id) => {
    return apiRequest(`${API_BASE_URL}/payment-methods/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Payments API
 */
export const paymentsAPI = {
  initializePaystack: async (data) => {
    return apiRequest(`${API_BASE_URL}/payments/paystack/initialize`, {
      method: 'POST',
      body: data,
    });
  },

  verifyPaystack: async (reference) => {
    return apiRequest(`${API_BASE_URL}/payments/paystack/verify`, {
      method: 'POST',
      body: { reference },
    });
  },
};

/**
 * Admin Auth API
 */
export const adminAuthAPI = {
  getCaptcha: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin/captcha`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    return apiRequest(`${API_BASE_URL}/auth/admin/login`, {
      method: 'POST',
      body: credentials,
    });
  },

  getMe: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin/me`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  logout: async () => {
    return apiRequest(`${API_BASE_URL}/auth/admin/logout`, {
      method: 'POST',
    });
  },
};

/**
 * Settings API
 */
export const settingsAPI = {
  get: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/settings`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (settingsData) => {
    return apiRequest(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      body: settingsData,
    });
  },
};

/**
 * Support API
 */
export const supportAPI = {
  submitTicket: async (ticketData) => {
    return apiRequest(`${API_BASE_URL}/support`, {
      method: 'POST',
      body: ticketData,
    });
  },

  getTickets: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/support${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getTicket: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/support/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateTicket: async (id, ticketData) => {
    return apiRequest(`${API_BASE_URL}/support/${id}`, {
      method: 'PUT',
      body: ticketData,
    });
  },

  deleteTicket: async (id) => {
    return apiRequest(`${API_BASE_URL}/support/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Categories API
 */
export const categoriesAPI = {
  ...createCrudAPI('categories', { withSignal: true }),

  getActive: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories/active`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Brands API
 */
export const brandsAPI = {
  ...createCrudAPI('brands', { withSignal: true }),

  getActive: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/brands/active`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export default {
  products: productsAPI,
  services: servicesAPI,
  orders: ordersAPI,
  contact: contactAPI,
  repairs: repairsAPI,
  auth: authAPI,
  upload: uploadAPI,
  users: usersAPI,
  marketing: marketingAPI,
  wishlist: wishlistAPI,
  cart: cartAPI,
  account: accountAPI,
  paymentMethods: paymentMethodsAPI,
  payments: paymentsAPI,
  categories: categoriesAPI,
  brands: brandsAPI,
  settings: settingsAPI,
  support: supportAPI,
  notifications: notificationsAPI,
  healthCheck,
};
