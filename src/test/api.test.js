/**
 * API Client Test Suite
 * ---------------------
 * Tests for the centralized API client located in `src/services/api.js`.
 *
 * The API client wraps the native `fetch` function and provides helper
 * objects (productsAPI, authAPI, contactAPI, ordersAPI) that handle:
 *   - Building correct endpoint URLs from API_BASE_URL
 *   - Attaching credentials ('include') for cookie-based auth
 *   - Automatically fetching and caching CSRF tokens for write requests
 *   - Propagating meaningful error messages from the server
 *
 * Structure:
 *   1. Mock & helper setup (mockFetch, createMockResponse, CSRF_URL)
 *   2. Top-level "API Client" suite with beforeEach/afterEach for isolation
 *   3. Nested suites for each API domain: productsAPI, authAPI, contactAPI,
 *      ordersAPI, error handling, and clearCsrfCache
 *
 * Mocking strategy:
 *   - `mockFetch` is a vitest mock function that replaces the global `fetch`.
 *   - `vi.stubGlobal('fetch', mockFetch)` swaps in the mock before each test.
 *   - `mockResolvedValueOnce` is used for CSRF-then-request sequences because
 *     the API client makes two sequential fetches (token fetch, then the
 *     actual request).
 *   - `vi.unstubAllGlobals()` restores the real fetch after each test.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  productsAPI,
  authAPI,
  contactAPI,
  ordersAPI,
  clearCsrfCache,
} from '../services/api';
import { API_BASE_URL } from '../constants';

// Master mock for the global fetch function; each test controls its return value
const mockFetch = vi.fn();

// CSRF endpoint is derived from API_BASE_URL by stripping the /v1 suffix
const CSRF_URL = `${API_BASE_URL.replace(/\/v1\/?$/, '')}/csrf-token`;

/**
 * Factory that builds a realistic Response-like object for mocked fetch.
 *
 * @param {Object} opts
 * @param {number} opts.status - HTTP status code (default 200)
 * @param {Object|string} opts.body - Response payload (default {})
 * @param {string} opts.url - Request URL (default '/api/v1/test')
 * @param {string} opts.method - HTTP method (default 'GET')
 * @returns {Object} A mock Response with ok, status, json(), text(), headers, etc.
 */
function createMockResponse({ status = 200, body = {}, url = '/api/v1/test', method = 'GET' } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'OK',
    url,
    method,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
    headers: new Headers(),
  };
}

describe('API Client', () => {
  beforeEach(() => {
    // Reset the mock call history so assertions from one test don't leak into the next
    mockFetch.mockReset();
    // Clear any cached CSRF token so each test starts with a fresh token fetch
    clearCsrfCache();
    // Replace the global fetch with our mock for the duration of each test
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    // Restore the original global fetch after each test to avoid side effects
    vi.unstubAllGlobals();
  });

  describe('productsAPI', () => {
    it('should call getAll with correct URL and credentials', async () => {
      const mockData = { success: true, data: [{ name: 'Phone' }] };
      mockFetch.mockResolvedValue(createMockResponse({ status: 200, body: mockData }));

      const result = await productsAPI.getAll();
      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/products`,
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should append query params to getAll URL', async () => {
      const mockData = { success: true, data: [] };
      mockFetch.mockResolvedValue(createMockResponse({ status: 200, body: mockData }));

      await productsAPI.getAll({ category: 'Smartphones', page: 1 });
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/products?category=Smartphones&page=1`,
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should call getById with correct URL', async () => {
      const mockData = { success: true, data: { name: 'Test' } };
      mockFetch.mockResolvedValue(createMockResponse({ status: 200, body: mockData }));

      await productsAPI.getById('123');
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/products/123`,
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should fetch CSRF token before create and include it in headers', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'test-csrf-token' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      const mockData = { success: true, data: { _id: '123' } };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 201, body: mockData })
      );

      const result = await productsAPI.create({ name: 'New Product' });
      expect(result).toEqual(mockData);

      const createCall = mockFetch.mock.calls[1];
      expect(createCall[1].headers['X-CSRF-Token']).toBe('test-csrf-token');
      expect(createCall[1].body).toBe(JSON.stringify({ name: 'New Product' }));
    });

    it('should cache CSRF token for subsequent requests', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'cached-token' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      mockFetch.mockResolvedValue(
        createMockResponse({ status: 201, body: { success: true } })
      );

      await productsAPI.create({ name: 'Product 1' });
      await productsAPI.create({ name: 'Product 2' });

      const csrfCalls = mockFetch.mock.calls.filter(
        (call) => call[0].includes('/csrf-token')
      );
      expect(csrfCalls).toHaveLength(1);
    });

    it('should call delete with correct URL and method', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'delete-csrf' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      const mockData = { success: true, message: 'Deleted' };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 200, body: mockData })
      );

      await productsAPI.delete('123');
      const deleteCall = mockFetch.mock.calls[1];
      expect(deleteCall[0]).toBe(`${API_BASE_URL}/products/123`);
      expect(deleteCall[1].method).toBe('DELETE');
      expect(deleteCall[1].headers['X-CSRF-Token']).toBe('delete-csrf');
    });

    it('should call update with correct URL, method, and body', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'update-csrf' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      const mockData = { success: true, data: { name: 'Updated' } };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 200, body: mockData })
      );

      const updateData = { name: 'Updated Product' };
      await productsAPI.update('123', updateData);
      const updateCall = mockFetch.mock.calls[1];
      expect(updateCall[0]).toBe(`${API_BASE_URL}/products/123`);
      expect(updateCall[1].method).toBe('PUT');
      expect(updateCall[1].headers['X-CSRF-Token']).toBe('update-csrf');
      expect(updateCall[1].body).toBe(JSON.stringify(updateData));
    });
  });

  describe('authAPI', () => {
    it('should call login with correct URL, body, and CSRF header', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'auth-csrf' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      const mockData = { success: true, data: { user: { email: 'test@test.com' } } };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 200, body: mockData })
      );

      const credentials = { email: 'test@test.com', password: 'password123' };
      const result = await authAPI.login(credentials);
      expect(result).toEqual(mockData);

      const loginCall = mockFetch.mock.calls[1];
      expect(loginCall[0]).toBe(`${API_BASE_URL}/auth/login`);
      expect(loginCall[1].method).toBe('POST');
      expect(loginCall[1].headers['X-CSRF-Token']).toBe('auth-csrf');
      expect(loginCall[1].body).toBe(JSON.stringify(credentials));
    });

    it('should call getMe without CSRF header (GET request)', async () => {
      const mockData = { success: true, data: { user: { email: 'test@test.com' } } };
      mockFetch.mockResolvedValue(
        createMockResponse({ status: 200, body: mockData })
      );

      await authAPI.getMe();
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/auth/me`,
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  describe('contactAPI', () => {
    it('should submit form with CSRF header', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'contact-csrf' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);

      const mockData = { success: true, message: 'Message sent' };
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 200, body: mockData })
      );

      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      const result = await contactAPI.submit(formData);
      expect(result).toEqual(mockData);

      const submitCall = mockFetch.mock.calls[1];
      expect(submitCall[0]).toBe(`${API_BASE_URL}/contact`);
      expect(submitCall[1].headers['X-CSRF-Token']).toBe('contact-csrf');
      expect(submitCall[1].body).toBe(JSON.stringify(formData));
    });
  });

  describe('ordersAPI', () => {
    it('should call getAll with correct URL', async () => {
      const mockData = { success: true, data: [] };
      mockFetch.mockResolvedValue(createMockResponse({ status: 200, body: mockData }));

      await ordersAPI.getAll();
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/orders`,
        expect.objectContaining({ credentials: 'include' })
      );
    });

    it('should call getStats with correct URL', async () => {
      const mockData = { success: true, data: { total: 10 } };
      mockFetch.mockResolvedValue(createMockResponse({ status: 200, body: mockData }));

      await ordersAPI.getStats();
      expect(mockFetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/orders/stats`,
        expect.objectContaining({ credentials: 'include' })
      );
    });
  });

  describe('error handling', () => {
    it('should throw with error message from response', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ status: 400, body: { message: 'Bad request' } })
      );

      await expect(productsAPI.getAll()).rejects.toThrow('Bad request');
    });

    it('should throw generic error when response has no message', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ status: 500, body: {} })
      );

      await expect(productsAPI.getAll()).rejects.toThrow('An error occurred');
    });

    it('should throw custom message for 404', async () => {
      mockFetch.mockResolvedValue(
        createMockResponse({ status: 404, body: { message: 'Product not found' } })
      );

      await expect(productsAPI.getById('nonexistent')).rejects.toThrow('Product not found');
    });

    it('should clear CSRF cache and dispatch unauthorized event on 401', async () => {
      const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');

      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 401, body: { message: 'Unauthorized' } })
      );

      await expect(productsAPI.getAll()).rejects.toThrow('Unauthorized');

      expect(dispatchEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'trtech:unauthorized' })
      );
      dispatchEventSpy.mockRestore();
    });
  });

  describe('clearCsrfCache', () => {
    it('should clear cached CSRF token (indirectly via repeated create calls)', async () => {
      const csrfResponse = createMockResponse({
        status: 200,
        body: { csrfToken: 'first-token' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse);
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 201, body: { success: true } })
      );

      await productsAPI.create({ name: 'Product A' });

      clearCsrfCache();

      const csrfResponse2 = createMockResponse({
        status: 200,
        body: { csrfToken: 'second-token' },
        url: CSRF_URL,
      });
      mockFetch.mockResolvedValueOnce(csrfResponse2);
      mockFetch.mockResolvedValueOnce(
        createMockResponse({ status: 201, body: { success: true } })
      );

      await productsAPI.create({ name: 'Product B' });

      const csrfCalls = mockFetch.mock.calls.filter(
        (call) => call[0].includes('/csrf-token')
      );
      expect(csrfCalls).toHaveLength(2);
    });
  });
});
