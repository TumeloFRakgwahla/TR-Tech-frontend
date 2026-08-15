import { describe, it, expect } from 'vitest';
import {
  getProductId,
  getPublicImageUrl,
  getProductImageUrls,
  buildSpecifications,
  formatPrice,
  getSafeErrorMessage
} from '../components/ProductDetail/helpers';

describe('getProductId', () => {
  it('returns _id when available', () => {
    expect(getProductId({ _id: '123' })).toBe('123');
  });

  it('falls back to id when _id is missing', () => {
    expect(getProductId({ id: '456' })).toBe('456');
  });

  it('returns undefined for empty object', () => {
    expect(getProductId({})).toBeUndefined();
  });

  it('returns undefined for null', () => {
    expect(getProductId(null)).toBeUndefined();
  });
});

describe('getPublicImageUrl', () => {
  it('returns empty string for null/undefined', () => {
    expect(getPublicImageUrl(null)).toBe('');
    expect(getPublicImageUrl(undefined)).toBe('');
  });

  it('resolves /uploads/ paths', () => {
    const url = getPublicImageUrl('/uploads/test.jpg');
    expect(url).toBe('http://localhost:5000/uploads/test.jpg');
  });

  it('passes through absolute URLs', () => {
    expect(getPublicImageUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg');
  });

  it('resolves relative paths', () => {
    const url = getPublicImageUrl('img.jpg');
    expect(url).toBe('http://localhost:5000/img.jpg');
  });
});

describe('buildSpecifications', () => {
  it('returns existing specifications when present', () => {
    const product = {
      specifications: { 'Screen Size': '6.1"', 'RAM': '8GB' },
      category: 'Smartphones',
      condition: 'New',
      stock: 10,
      status: 'Active'
    };
    const specs = buildSpecifications(product, 10);
    expect(specs).toEqual([['Screen Size', '6.1"'], ['RAM', '8GB']]);
  });

  it('falls back to default specs when specifications empty', () => {
    const product = {
      specifications: {},
      category: 'Smartphones',
      condition: 'New',
      stock: 10,
      status: 'Active'
    };
    const specs = buildSpecifications(product, 10);
    expect(specs.length).toBe(4);
    expect(specs[0]).toEqual(['Category', 'Smartphones']);
  });
});

describe('formatPrice', () => {
  it('formats number as ZAR locale string', () => {
    const result = formatPrice(1500);
    expect(result).toBe('1\u00A0500');
  });

  it('handles zero', () => {
    expect(formatPrice(0)).toBe('0');
  });

  it('handles undefined/null', () => {
    expect(formatPrice(undefined)).toBe('0');
    expect(formatPrice(null)).toBe('0');
  });
});

describe('getSafeErrorMessage', () => {
  it('returns default message when no error', () => {
    expect(getSafeErrorMessage(null)).toBe('We could not find this product.');
    expect(getSafeErrorMessage(undefined)).toBe('We could not find this product.');
  });

  it('returns generic message for not found errors', () => {
    expect(getSafeErrorMessage('Product not found')).toBe('We could not find this product.');
    expect(getSafeErrorMessage('Not found')).toBe('We could not find this product.');
  });

  it('returns generic message for other errors', () => {
    expect(getSafeErrorMessage('Server error')).toBe('Something went wrong. Please try again later.');
  });
});
