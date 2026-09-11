import { API_BASE_URL } from '../../constants';
import { createCrudAPI, apiRequest, fetchWithTimeout, handleResponse } from '../shared';

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

  track: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetchWithTimeout(`${API_BASE_URL}/orders/track${queryString ? `?${queryString}` : ''}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};
