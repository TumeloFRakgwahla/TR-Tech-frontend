/**
 * TR-Tech Backend API Service
 * 
 * This service handles all API calls to the TR-Tech backend.
 * Update the API_BASE_URL to point to your backend server.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  return data;
};

/**
 * Products API
 */
export const productsAPI = {
  // Get all products
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  // Get single product by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    return handleResponse(response);
  },

  // Create new product (requires auth)
  create: async (productData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Update product (requires auth)
  update: async (id, productData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Delete product (requires auth)
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },
};

/**
 * Services API
 */
export const servicesAPI = {
  // Get all services
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/services${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  // Get single service by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`);
    return handleResponse(response);
  },

  // Create new service (requires auth)
  create: async (serviceData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Update service (requires auth)
  update: async (id, serviceData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Delete service (requires auth)
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  // Get all orders (requires auth for admin)
  getAll: async (params = {}) => {
    const token = getAuthToken();
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },

  // Get single order by ID (requires auth)
  getById: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },

  // Create new order
  create: async (orderData) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  // Update order status (requires auth)
  updateStatus: async (id, status) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Delete order (requires auth)
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },
};

/**
 * Contact API
 */
export const contactAPI = {
  // Submit contact form
  submit: async (formData) => {
    const response = await fetch(`${API_BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    return handleResponse(response);
  },

  // Get all contact messages (admin only - requires auth)
  getAll: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/contact`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },
};

/**
 * Repairs API
 */
export const repairsAPI = {
  // Get all repairs (requires auth for admin)
  getAll: async (params = {}) => {
    const token = getAuthToken();
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/repairs${queryString ? `?${queryString}` : ''}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },

  // Get single repair by ID (requires auth)
  getById: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
    });
    return handleResponse(response);
  },

  // Create new repair
  create: async (repairData) => {
    const response = await fetch(`${API_BASE_URL}/repairs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repairData),
    });
    return handleResponse(response);
  },

  // Update repair (requires auth)
  update: async (id, repairData) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(repairData),
    });
    return handleResponse(response);
  },

  // Delete repair (requires auth)
  delete: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
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
  // Register a new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login user
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Get current user profile
  getMe: async () => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/auth/updateprofile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
  // Upload single image (requires auth)
  uploadImage: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/upload/image`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData,
    });
    return handleResponse(response);
  },

  // Delete image (requires auth)
  deleteImage: async (filename) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/upload/image/${filename}`, {
      method: 'DELETE',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
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
  healthCheck,
};
