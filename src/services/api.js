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

/**
 * Makes an API request with automatic CSRF token handling and retry on 419.
 * For JSON requests, pass the body as a plain object — it will be JSON.stringify'd.
 * For FormData requests, pass isFormData: true and a bodyFactory function.
 */
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

/**
 * Products API
 */
export const productsAPI = {
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getLowStock: async (threshold = 10) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

   create: async (productData) => {
     return apiRequest(`${API_BASE_URL}/products`, {
       method: 'POST',
       body: productData,
     });
   },

   update: async (id, productData) => {
     return apiRequest(`${API_BASE_URL}/products/${id}`, {
       method: 'PUT',
       body: productData,
     });
   },

   delete: async (id) => {
     const csrfHeaders = await getCsrfHeader();
     const response = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
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
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/services${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/services/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (serviceData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/services`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/services/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/services/${id}`, {
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
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/stats`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (orderData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
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

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/contact`, {
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
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (repairData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/repairs/${id}`, {
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
  const baseUrl = API_BASE_URL.replace(/\/v1\/?$/, '');
  const response = await fetchWithTimeout(`${baseUrl}/health`);
  return handleResponse(response);
};

/**
 * Auth API
 */
export const authAPI = {
  register: async (userData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/register`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/login`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/updateprofile`, {
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: csrfHeaders,
      credentials: 'include',
    });
    return handleResponse(response);
  },

  resendVerification: async (email) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify({ email }),
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/upload/image/${filename}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (id, userData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  resetPassword: async (id, password) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/users/${id}/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify({ password }),
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/coupons`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/coupons/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/campaigns`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/campaigns/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/promotions`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/promotions/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/marketing/promotions/${id}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (productId) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist/${productId}`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(itemData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  update: async (productId, quantity) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/cart/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify({ quantity }),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  remove: async (productId) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/cart/${productId}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  clear: async () => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/cart`, {
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
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/profile`, {
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

  changePassword: async (passwordData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(passwordData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getAddresses: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  createAddress: async (addressData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(addressData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateAddress: async (id, addressData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(addressData),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  deleteAddress: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  setDefaultAddress: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/addresses/${id}/default`, {
      method: 'POST',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getNotifications: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/notifications`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateNotifications: async (prefs) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(prefs),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getSessions: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/sessions`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  revokeSession: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/account/sessions/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const paymentMethodsAPI = {
  getAll: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment-methods`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  add: async (data) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    return handleResponse(response);
  },

  setDefault: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment-methods/${id}/default`, {
      method: 'POST',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  remove: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/payment-methods/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const adminAuthAPI = {
  login: async (credentials) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin/login`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin/me`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  logout: async () => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/admin/logout`, {
      method: 'POST',
      headers: csrfHeaders,
      credentials: 'include',
    });
    return handleResponse(response);
  },
};

export const categoriesAPI = {
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getActive: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories/active`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/categories/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (data) => {
    return apiRequest(`${API_BASE_URL}/categories`, { method: 'POST', body: data });
  },

  update: async (id, data) => {
    return apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'PUT', body: data });
  },

  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
  },
};

export const brandsAPI = {
  getAll: async (params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/brands${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
      signal: options.signal,
    });
    return handleResponse(response);
  },

  getActive: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/brands/active`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/brands/${id}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  create: async (data) => {
    return apiRequest(`${API_BASE_URL}/brands`, { method: 'POST', body: data });
  },

  update: async (id, data) => {
    return apiRequest(`${API_BASE_URL}/brands/${id}`, { method: 'PUT', body: data });
  },

  delete: async (id) => {
    return apiRequest(`${API_BASE_URL}/brands/${id}`, { method: 'DELETE' });
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
