/**
 * TR-Tech Backend API Service
 * 
 * This service handles all API calls to the TR-Tech backend.
 * Update the API_BASE_URL to point to your backend server.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

  // Create new product
  create: async (productData) => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Update product
  update: async (id, productData) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    return handleResponse(response);
  },

  // Delete product
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
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

  // Create new service
  create: async (serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Update service
  update: async (id, serviceData) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    return handleResponse(response);
  },

  // Delete service
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  // Get all orders
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  // Get single order by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`);
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

  // Update order status
  updateStatus: async (id, status) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse(response);
  },

  // Delete order
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE',
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

  // Get all contact messages (admin only)
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/contact`);
    return handleResponse(response);
  },
};

/**
 * Repairs API
 */
export const repairsAPI = {
  // Get all repairs
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/repairs${queryString ? `?${queryString}` : ''}`);
    return handleResponse(response);
  },

  // Get single repair by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`);
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

  // Update repair
  update: async (id, repairData) => {
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(repairData),
    });
    return handleResponse(response);
  },

  // Delete repair
  delete: async (id) => {
    const response = await fetch(`${API_BASE_URL}/repairs/${id}`, {
      method: 'DELETE',
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

export default {
  products: productsAPI,
  services: servicesAPI,
  orders: ordersAPI,
  contact: contactAPI,
  repairs: repairsAPI,
  healthCheck,
};
