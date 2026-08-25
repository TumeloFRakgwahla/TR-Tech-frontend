import { describe, it, expect } from 'vitest';
import { getProductImageUrl } from '../lib/imageUrl';

describe('getProductImageUrl', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(getProductImageUrl(null)).toBe('');
    expect(getProductImageUrl(undefined)).toBe('');
    expect(getProductImageUrl('')).toBe('');
  });

  describe('/uploads/ paths', () => {
    it('passes through /uploads/ paths with valid filenames', () => {
      expect(getProductImageUrl('/uploads/test.jpg')).toBe('/uploads/test.jpg');
      expect(getProductImageUrl('/uploads/product-image.png')).toBe('/uploads/product-image.png');
    });

    it('extracts first path segment from /uploads/ subpaths', () => {
      expect(getProductImageUrl('/uploads/folder/test.jpg')).toBe('/uploads/folder');
    });

    it('passes through /uploads/ paths to root', () => {
      expect(getProductImageUrl('/uploads/')).toBe('/uploads/');
    });
  });

  describe('absolute URLs', () => {
    it('passes through absolute URLs that do not start with /uploads/', () => {
      expect(getProductImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
      expect(getProductImageUrl('http://example.com/img.png')).toBe('http://example.com/img.png');
    });

    it('returns invalid URLs as-is', () => {
      expect(getProductImageUrl('https://[invalid')).toBe('https://[invalid');
    });

    it('resolves /uploads/ paths from absolute URLs in dev mode', () => {
      expect(getProductImageUrl('https://backend.example.com/uploads/test.jpg')).toBe('/uploads/test.jpg');
    });
  });

  describe('relative paths', () => {
    it('prepends /uploads/ to relative filenames', () => {
      expect(getProductImageUrl('img.jpg')).toBe('/uploads/img.jpg');
      expect(getProductImageUrl('photo.png')).toBe('/uploads/photo.png');
    });

    it('normalizes root-relative paths', () => {
      expect(getProductImageUrl('/img.jpg')).toBe('/uploads/img.jpg');
    });

    it('does not double-prepend /uploads/ to paths already starting with /uploads/', () => {
      expect(getProductImageUrl('/uploads/test.jpg')).toBe('/uploads/test.jpg');
    });
  });

  describe('edge cases', () => {
    it('handles paths with no extension', () => {
      expect(getProductImageUrl('no-extension')).toBe('/uploads/no-extension');
    });

    it('preserves query strings in /uploads/ paths', () => {
      expect(getProductImageUrl('/uploads/test.jpg?v=2')).toBe('/uploads/test.jpg?v=2');
    });

    it('handles paths with spaces', () => {
      expect(getProductImageUrl('/uploads/my product.jpg')).toBe('/uploads/my product.jpg');
    });
  });
});
