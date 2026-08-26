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
const DEFAULT_TIMEOUT = 15000;

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const originalSignal = options?.signal;
  if (originalSignal) {
    originalSignal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getCsrfToken() {
  const now = Date.now();
  if (cachedCsrfToken && csrfTokenExpiry && now < csrfTokenExpiry) {
    return cachedCsrfToken;
  }
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL.replace(/\/v1\/?$/, '')}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      csrfTokenExpiry = now + CSRF_CACHE_DURATION;
      return cachedCsrfToken;
    }
  } catch (err) {
    void err;
  }
  return null;
}

export function clearCsrfCache() {
  cachedCsrfToken = null;
  csrfTokenExpiry = null;
}

async function apiRequest(url, options = {}, isFormData = false, bodyFactory = null) {
  const doFetch = async (csrfToken) => {
    const headers = { ...(options.headers || {}) };
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
    if (!isFormData) headers['Content-Type'] = 'application/json';

    let body;
    if (isFormData && bodyFactory) {
      body = bodyFactory();
    } else if (!isFormData && options.body !== undefined) {
      body = JSON.stringify(options.body);
    }

    return fetchWithTimeout(url, {
      method: options.method || 'GET',
      headers,
      body,
      credentials: 'include',
    });
  };

  const initialToken = await getCsrfToken();
  let response = await doFetch(initialToken);

  if (response.status === 419) {
    clearCsrfCache();
    const freshToken = await getCsrfToken();
    if (freshToken) {
      response = await doFetch(freshToken);
    }
  }

  return handleResponse(response);
}

async function handleResponse(response) {
  if (response.status === 401) {
    clearCsrfCache();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('trtech:unauthorized'));
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred');
    error.status = response.status;
    if (data.errors) {
      error.info = JSON.stringify(data.errors);
    }
    if (data.details) {
      error.info = JSON.stringify(data.details);
    }
    throw error;
  }
  return data;
}

async function getCsrfHeader() {
  const token = await getCsrfToken();
  return token ? { 'X-CSRF-Token': token } : {};
}

function createCrudAPI(resourcePath, options = {}) {
  const { idParam = 'id', withSignal = false } = options;

  return {
    getAll: async (params = {}, options2 = {}) => {
      const queryString = new URLSearchParams(params).toString();
      const response = await fetchWithTimeout(`${API_BASE_URL}/${resourcePath}${queryString ? `?${queryString}` : ''}`, {
        credentials: 'include',
        signal: withSignal ? options2.signal : undefined,
      });
      return handleResponse(response);
    },

    getById: async (id) => {
      const response = await fetchWithTimeout(`${API_BASE_URL}/${resourcePath}/${id}`, {
        credentials: 'include',
      });
      return handleResponse(response);
    },

    create: async (data) => {
      return apiRequest(`${API_BASE_URL}/${resourcePath}`, {
        method: 'POST',
        body: data,
      });
    },

    update: async (id, data) => {
      return apiRequest(`${API_BASE_URL}/${resourcePath}/${id}`, {
        method: 'PUT',
        body: data,
      });
    },

    delete: async (id) => {
      return apiRequest(`${API_BASE_URL}/${resourcePath}/${id}`, {
        method: 'DELETE',
      });
    },
  };
}

/**
 * Products API
 */
export const productsAPI = {
  ...createCrudAPI('products', { withSignal: true }),

  getLowStock: async (threshold = 10) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

/**
 * Services API
 */
export const servicesAPI = createCrudAPI('services', { withSignal: true });

/**
 * Orders API
 */
export const ordersAPI = {
  ...createCrudAPI('orders', { withSignal: true }),

  getStats: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/stats`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateStatus: async (id, status) => {
    return apiRequest(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      body: { status },
    });
  },

  myOrders: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/my-orders${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  myOrder: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/my-orders/${id}`, {
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
 * Health Check
 */
export const healthCheck = async () => {
  const baseUrl = API_BASE_URL.replace(/\/v1\/?$/, '');
  const response = await fetchWithTimeout(`${baseUrl}/health`);
  return handleResponse(response);
};

/**
 * Auth API
 */
export const authAPI = {
  register: async (userData) => {
    return apiRequest(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: userData,
    });
  },

  login: async (credentials) => {
    return apiRequest(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: credentials,
    });
  },

  getMe: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    return apiRequest(`${API_BASE_URL}/auth/updateprofile`, {
      method: 'PUT',
      body: profileData,
    });
  },

  logout: async () => {
    return apiRequest(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
  },

  resendVerification: async (email) => {
    return apiRequest(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      body: { email },
    });
  },
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
 * Admin Auth API
 */
export const adminAuthAPI = {
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
  categories: categoriesAPI,
  brands: brandsAPI,
  healthCheck,
};
