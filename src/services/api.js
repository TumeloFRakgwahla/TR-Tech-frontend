/**
 * TR-Tech Backend API Service
 * 
 * This service handles all API calls to the TR-Tech backend.
 * Update the API_BASE_URL to point to your backend server.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const CSRF_TOKEN_KEY = 'csrf_token';

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

let cachedCsrfToken = null;

async function getCsrfToken() {
  if (cachedCsrfToken) {
    return cachedCsrfToken;
  }
  try {
    const res = await fetch(`${API_BASE_URL}/csrf-token`, { credentials: 'include' });
    const data = await res.json();
    if (data.csrfToken) {
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch {
    // Server unreachable or endpoint missing
  }
  return null;
}

function clearCsrfCache() {
  cachedCsrfToken = null;
}

function getAuthHeaders() {
  const authCookie = getCookie('authToken');
  const headers = {};
  if (authCookie) {
    headers['Authorization'] = `Bearer ${authCookie}`;
  }
  return headers;
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
    const response = await fetch(`${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
  },

  getLowStock: async (threshold = 10) => {
    const response = await fetch(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
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
    const response = await fetch(`${API_BASE_URL}/services${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`);
    return handleResponse(response);
  },

  create: async (serviceData) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
      body: JSON.stringify(serviceData),
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
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
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/stats`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
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
    });
    return handleResponse(response);
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      headers: {
        ...getAuthHeaders(),
      },
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
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(repairData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
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
    });
    return handleResponse(response);
  },

  getMe: async () => {
    const token = getCookie('authToken');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
    });
    return handleResponse(response);
  },

  updateProfile: async (profileData) => {
    const token = getCookie('authToken');
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...csrfHeaders,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },
};

/**
 * Upload API
 */
export const uploadAPI = {
  uploadImage: async (file) => {
    const token = getCookie('authToken');
    const csrfHeaders = await getCsrfHeader();
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...csrfHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return handleResponse(response);
  },

  deleteImage: async (filename) => {
    const token = getCookie('authToken');
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    return handleResponse(response);
  },
};

export const usersAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/users${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  delete: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },
};

export const marketingAPI = {
  getCoupons: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(couponData),
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(couponData),
    });
    return handleResponse(response);
  },

  deleteCoupon: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/coupons/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getCampaigns: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(campaignData),
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(campaignData),
    });
    return handleResponse(response);
  },

  deleteCampaign: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },

  getPromotions: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...getAuthHeaders(),
      },
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(promotionData),
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
        ...getAuthHeaders(),
      },
      body: JSON.stringify(promotionData),
    });
    return handleResponse(response);
  },

  deletePromotion: async (id) => {
    const csrfHeaders = await getCsrfHeader();
    const response = await fetch(`${API_BASE_URL}/marketing/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        ...csrfHeaders,
        ...getAuthHeaders(),
      },
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
  healthCheck,
};
