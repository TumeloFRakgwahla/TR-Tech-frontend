import { API_BASE_URL } from '../constants';

let cachedCsrfToken = null;
let csrfTokenExpiry = null;
const CSRF_CACHE_DURATION = 55 * 60 * 1000;
const DEFAULT_TIMEOUT = 15000;

export async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT) {
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

export async function getCsrfToken() {
  const now = Date.now();
  if (cachedCsrfToken && csrfTokenExpiry && now < csrfTokenExpiry) {
    return cachedCsrfToken;
  }
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL.replace(/\/v1\/?$/, '')}/csrf-token`, { credentials: 'include' });
    if (!res.ok) return null;
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

export async function apiRequest(url, options = {}, isFormData = false, bodyFactory = null) {
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

export async function handleResponse(response) {
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

export function createCrudAPI(resourcePath, options = {}) {
  const { withSignal = false } = options;

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
