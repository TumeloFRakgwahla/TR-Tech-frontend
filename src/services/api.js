/**
 * TR-Tech Backend API Service
 * 
 * This service handles all API calls to the TR-Tech backend.
 * Update the API_BASE_URL to point to your backend server.
 */

import { API_BASE_URL } from '../constants';

let cachedCsrfToken = null;
let csrfTokenExpiry = null;
const CSRF_CACHE_DURATION = 55 * 60 * 1000;

async function getCsrfToken() {
  const now = Date.now();
  if (cachedCsrfToken && csrfTokenExpiry && now < csrfTokenExpiry) {
    return cachedCsrfToken;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      csrfTokenExpiry = now + CSRF_CACHE_DURATION;
      return cachedCsrfToken;
    }
  } catch {
    // Server unreachable or endpoint missing
  }
  return null;
}

function clearCsrfCache() {
  cachedCsrfToken = null;
  csrfTokenExpiry = null;
}

function getAuthHeaders() {
  return {};
}

async function handleResponse(response) {
  if (response.status === 419) {
    const newToken = await getCsrfToken();
    if (newToken) {
      const retryHeaders = {
        ...(newToken && { 'X-CSRF-Token': newToken }),
        ...getAuthHeaders(),
      };
      return fetch(response.url, {
        method: response.method,
        headers: retryHeaders,
        body: response.method !== 'GET' && response.method !== 'HEAD' ? await response.text() : undefined,
        credentials: 'include',
      }).then(handleResponse);
    }
  }
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
}

async function getCsrfHeader() {
  const token = await getCsrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
}

/**
 * Products API
 */
export const productsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getLowStock: async (threshold = 10) => {
    const response = await fetch(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (productData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(productData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (id, productData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(productData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Services API
 */
export const servicesAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/services${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (serviceData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(serviceData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (id, serviceData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(serviceData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/stats`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (orderData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(orderData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify({ status }),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Contact API
 */
export const contactAPI = {
  submit: async (formData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(formData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Repairs API
 */
export const repairsAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/repairs${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (repairData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/repairs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(repairData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (id, repairData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(repairData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Health Check
 */
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
  return handleResponse(response);
};

/**
 * Auth API
 */
export const authAPI = {
  register: async (userData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  login: async (credentials) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    if (response.status === 401) {
      return { success: false, user: null };
    }
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(profileData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Upload API
 */
export const uploadAPI = {
  uploadImage: async (file) => {
    const csrfHeaders = await getCsrfHeader();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...csrfHeaders,
      },
      body: formData,
      credentials: 'include',
    });
    return handleResponse(response);
  },

  uploadImages: async (files) => {
    const csrfHeaders = await getCsrfHeader();
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await fetch(`${API_BASE_URL}/upload/images`, {
      method: 'POST',
      headers: {
        ...csrfHeaders,
      },
      body: formData,
      credentials: 'include',
    });
    return handleResponse(response);
  },

  deleteImage: async (filename) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (id, userData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(userData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const marketingAPI = {
  getCoupons: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createCoupon: async (couponData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(couponData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateCoupon: async (id, couponData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(couponData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  deleteCoupon: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createCampaign: async (campaignData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(campaignData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateCampaign: async (id, campaignData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(campaignData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  deleteCampaign: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getPromotions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createPromotion: async (promotionData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(promotionData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updatePromotion: async (id, promotionData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(promotionData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  deletePromotion: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Wishlist API
 */
export const wishlistAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (productId) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  remove: async (productId) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  check: async (productId) => {
    const response = await fetch(`${API_BASE_URL}/wishlist/check/${productId}`, {
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
  healthCheck,
};
