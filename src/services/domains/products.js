import { API_BASE_URL } from '../constants';
import { createCrudAPI, fetchWithTimeout, handleResponse } from '../shared';

export const productsAPI = {
  ...createCrudAPI('products', { withSignal: true }),

  getLowStock: async (threshold = 10) => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/low-stock?threshold=${threshold}`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getUniqueCategories: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/categories/unique`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },

  getUniqueBrands: async () => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/products/brands/unique`, {
      credentials: 'include',
    });
    return handleResponse(response);
  },
};
