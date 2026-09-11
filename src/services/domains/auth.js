import { API_BASE_URL } from '../../constants';
import { apiRequest } from '../shared';

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
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include',
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || 'An error occurred');
      error.status = response.status;
      throw error;
    }
    return data;
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
