/**
 * Image URL Utility Test Suite
 * ----------------------------
 * Tests for the `getProductImageUrl` helper in `src/lib/imageUrl.js`.
 *
 * This function normalizes product image URLs into a consistent format
 * that the frontend can safely render. It handles several input categories:
 *   - null/undefined/empty strings → empty string (no image to show)
 *   - /uploads/ paths → passed through, with deep subpaths collapsed to
 *     the first path segment
 *   - Absolute URLs → passed through as-is, except backend-origin /uploads/
 *     URLs are rewritten to the local /uploads/ prefix (dev mode behavior)
 *   - Relative paths → prepended with /uploads/
 *   - Edge cases: missing extensions, query strings, spaces
 *
 * Structure:
 *   A single top-level describe with nested describes grouping tests by
 *   input category.
 */

import { describe, it, expect } from 'vitest';
import { getProductImageUrl } from '../lib/imageUrl';

/**
 * Top-level suite for getProductImageUrl.
 * Tests null/undefined/empty handling, /uploads/ path handling, absolute URL
 * handling, relative path resolution, and various edge cases.
 */

describe('getProductImageUrl', () => {
  // Falsy inputs should return an empty string so the UI can handle missing images
  it('returns empty string for null/undefined/empty', () => {
    expect(getProductImageUrl(null)).toBe('');
    expect(getProductImageUrl(undefined)).toBe('');
    expect(getProductImageUrl('')).toBe('');
  });

  /**
   * /uploads/ paths subgroup: verifies behavior for URLs that already point
   * to the local uploads directory.
   */
  describe('/uploads/ paths', () => {
    // Valid /uploads/ paths with filenames should be returned unchanged
    it('passes through /uploads/ paths with valid filenames', () => {
      expect(getProductImageUrl('/uploads/test.jpg')).toBe('/uploads/test.jpg');
      expect(getProductImageUrl('/uploads/product-image.png')).toBe('/uploads/product-image.png');
    });

    // Deep subpaths are collapsed to the first path segment after /uploads/
    // This prevents deep relative paths from breaking image loading
    it('extracts first path segment from /uploads/ subpaths', () => {
      expect(getProductImageUrl('/uploads/folder/test.jpg')).toBe('/uploads/folder');
    });

    // A bare /uploads/ with no filename is returned as-is
    it('passes through /uploads/ paths to root', () => {
      expect(getProductImageUrl('/uploads/')).toBe('/uploads/');
    });
  });

  /**
   * Absolute URLs subgroup: verifies behavior for fully qualified URLs
   * (e.g., from a CDN or external source).
   */
  describe('absolute URLs', () => {
    // External URLs should pass through without modification
    it('passes through absolute URLs that do not start with /uploads/', () => {
      expect(getProductImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
      expect(getProductImageUrl('http://example.com/img.png')).toBe('http://example.com/img.png');
    });

    // Malformed URLs are returned as-is rather than throwing
    it('returns invalid URLs as-is', () => {
      expect(getProductImageUrl('https://[invalid')).toBe('https://[invalid');
    });

    // Backend-origin /uploads/ URLs are rewritten to the local /uploads/ prefix.
    // This handles the case where the backend returns absolute URLs with its
    // own domain, but the frontend should serve them from its own origin.
    it('resolves /uploads/ paths from absolute URLs in dev mode', () => {
      expect(getProductImageUrl('https://backend.example.com/uploads/test.jpg')).toBe('/uploads/test.jpg');
    });
  });

  /**
   * Relative paths subgroup: verifies normalization of paths that don't
   * start with a scheme or the /uploads/ prefix.
   */
  describe('relative paths', () => {
    // Relative filenames are prefixed with /uploads/ to form a valid public path
    it('prepends /uploads/ to relative filenames', () => {
      expect(getProductImageUrl('img.jpg')).toBe('/uploads/img.jpg');
      expect(getProductImageUrl('photo.png')).toBe('/uploads/photo.png');
    });

    // Root-relative paths (leading slash but not /uploads/) are normalized
    it('normalizes root-relative paths', () => {
      expect(getProductImageUrl('/img.jpg')).toBe('/uploads/img.jpg');
    });

    // Idempotency: paths already starting with /uploads/ should not be double-prefixed
    it('does not double-prepend /uploads/ to paths already starting with /uploads/', () => {
      expect(getProductImageUrl('/uploads/test.jpg')).toBe('/uploads/test.jpg');
    });
  });

  /**
   * Edge cases subgroup: covers unusual inputs that don't fit the main categories.
   */
  describe('edge cases', () => {
    // Filenames without extensions should still receive the /uploads/ prefix
    it('handles paths with no extension', () => {
      expect(getProductImageUrl('no-extension')).toBe('/uploads/no-extension');
    });

    // Query strings (e.g., cache-busting ?v=2) should be preserved
    it('preserves query strings in /uploads/ paths', () => {
      expect(getProductImageUrl('/uploads/test.jpg?v=2')).toBe('/uploads/test.jpg?v=2');
    });

    // Spaces in paths should be preserved (URL encoding is handled by the browser)
    it('handles paths with spaces', () => {
      expect(getProductImageUrl('/uploads/my product.jpg')).toBe('/uploads/my product.jpg');
    });
  });
});
