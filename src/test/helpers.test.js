/**
 * ProductDetail Helpers Test Suite
 * --------------------------------
 * Tests for utility functions used by the ProductDetail page
 * (`src/components/ProductDetail/helpers.js`).
 *
 * Covers five helper functions:
 *   - getProductId: safely extracts an ID from a product object, handling
 *     both MongoDB's `_id` field and a plain `id` field
 *   - getPublicImageUrl: normalizes product image URLs, ensuring /uploads/
 *     prefix and resolving relative paths
 *   - buildSpecifications: builds a list of product specifications, either
 *     from an explicit `specifications` object or derived from product
 *     metadata (category, condition, stock, status)
 *   - formatPrice: formats a numeric price as a ZAR locale string
 *   - getSafeErrorMessage: maps raw error strings to user-friendly messages
 *
 * Structure:
 *   One top-level describe per helper function, with multiple `it` blocks
 *   covering normal usage, edge cases, and fallback behavior.
 */

import { describe, it, expect } from 'vitest';
import {
  getProductId,
  getPublicImageUrl,
  buildSpecifications,
  formatPrice,
  getSafeErrorMessage
} from '../components/ProductDetail/helpers';

/**
 * Test suite for getProductId.
 * Verifies that the helper correctly prefers `_id` (MongoDB convention),
 * falls back to `id`, and safely returns undefined for null/empty objects.
 */

describe('getProductId', () => {
  // MongoDB documents use `_id`; the helper should return it directly
  it('returns _id when available', () => {
    expect(getProductId({ _id: '123' })).toBe('123');
  });

  // Fallback: some APIs may return `id` instead of `_id`
  it('falls back to id when _id is missing', () => {
    expect(getProductId({ id: '456' })).toBe('456');
  });

  // Empty objects have no ID field, so return undefined gracefully
  it('returns undefined for empty object', () => {
    expect(getProductId({})).toBeUndefined();
  });

  // null input must not throw — the helper should guard against it
  it('returns undefined for null', () => {
    expect(getProductId(null)).toBeUndefined();
  });
});

/**
 * Test suite for getPublicImageUrl.
 * Verifies URL normalization: passthrough for /uploads/ paths and absolute URLs,
 * /uploads/ prefix injection for relative paths, and safe empty-string returns.
 */

describe('getPublicImageUrl', () => {
  // null and undefined should return an empty string (no image to render)
  it('returns empty string for null/undefined', () => {
    expect(getPublicImageUrl(null)).toBe('');
    expect(getPublicImageUrl(undefined)).toBe('');
  });

  // /uploads/ paths are already public and should be returned as-is
  it('resolves /uploads/ paths', () => {
    const url = getPublicImageUrl('/uploads/test.jpg');
    expect(url).toBe('/uploads/test.jpg');
  });

  // Absolute URLs (e.g., from a CDN) should be returned without modification
  it('passes through absolute URLs', () => {
    expect(getPublicImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  // Relative paths (no leading slash) should be prefixed with /uploads/
  it('resolves relative paths', () => {
    const url = getPublicImageUrl('img.jpg');
    expect(url).toBe('/uploads/img.jpg');
  });
});

/**
 * Test suite for buildSpecifications.
 * Verifies that the helper returns existing specifications when available,
 * and falls back to generating defaults from product metadata otherwise.
 */

describe('buildSpecifications', () => {
  // When the product already has a specifications object, use it directly
  it('returns existing specifications when present', () => {
    const product = {
      specifications: { 'Screen Size': '6.1"', 'RAM': '8GB' },
      category: 'Smartphones',
      condition: 'New',
      stock: 10,
      status: 'Active'
    };
    const specs = buildSpecifications(product, 10);
    // Specifications are returned as key-value pairs (array of tuples)
    expect(specs).toEqual([['Screen Size', '6.1"'], ['RAM', '8GB']]);
  });

  // When specifications is empty, the helper generates defaults from metadata.
  // The second arg (price 10) may influence which specs are included.
  it('falls back to default specs when specifications empty', () => {
    const product = {
      specifications: {},
      category: 'Smartphones',
      condition: 'New',
      stock: 10,
      status: 'Active'
    };
    const specs = buildSpecifications(product, 10);
    // Expect 4 default specifications (Category, Condition, Stock, Status)
    expect(specs.length).toBe(4);
    // The first one should be Category derived from the product
    expect(specs[0]).toEqual(['Category', 'Smartphones']);
  });
});

/**
 * Test suite for formatPrice.
 * Verifies ZAR locale formatting, zero handling, and null/undefined safety.
 */

describe('formatPrice', () => {
  // 1500 should be formatted as a ZAR locale string with a non-breaking space
  it('formats number as ZAR locale string', () => {
    const result = formatPrice(1500);
    // \u00A0 is a non-breaking space, used by Intl.NumberFormat for ZAR
    expect(result).toBe('1\u00A0500');
  });

  // Zero should return a simple "0" string
  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0');
  });

  // undefined and null should safely return "0" instead of throwing
  it('handles undefined/null', () => {
    expect(formatPrice(undefined)).toBe('0');
    expect(formatPrice(null)).toBe('0');
  });
});

/**
 * Test suite for getSafeErrorMessage.
 * Verifies that raw error strings are mapped to user-friendly messages,
 * with special handling for "not found" errors.
 */

describe('getSafeErrorMessage', () => {
  // null/undefined errors (no error info) return a product-specific default
  it('returns default message when no error', () => {
    expect(getSafeErrorMessage(null)).toBe('We could not find this product.');
    expect(getSafeErrorMessage(undefined)).toBe('We could not find this product.');
  });

  // Errors containing "not found" are mapped to a product-specific message
  it('returns generic message for not found errors', () => {
    expect(getSafeErrorMessage('Product not found')).toBe('We could not find this product.');
    expect(getSafeErrorMessage('Not found')).toBe('We could not find this product.');
  });

  // All other errors get a generic fallback message
  it('returns generic message for other errors', () => {
    expect(getSafeErrorMessage('Server error')).toBe('Something went wrong. Please try again later.');
  });
});
