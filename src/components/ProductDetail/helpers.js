/**
 * ProductDetail Helpers
 *
 * Utility functions for the ProductDetail components.
 * Provides helpers for:
 *   - Product ID extraction
 *   - Image URL processing
 *   - Specifications building
 *   - Price formatting
 *   - Error message sanitization
 */

import { getProductImageUrl as getCanonicalProductImageUrl } from '../../lib/imageUrl';

// Locale for price formatting (South African Rand)
const PRICE_LOCALE = 'en-ZA';

/**
 * Extracts the product ID from a product object.
 * Supports both _id (MongoDB) and id formats.
 */
export function getProductId(product) {
  return product?._id || product?.id;
}

// Re-export the canonical image URL getter
export { getCanonicalProductImageUrl as getProductImageUrl };

/**
 * Gets the public image URL for a product image.
 * Wraps the canonical image URL function.
 */
export function getPublicImageUrl(url) {
  return getCanonicalProductImageUrl(url);
}

/**
 * Builds an array of image URLs from a product object.
 * Handles both single image and multiple images array.
 * Filters out falsy values and maps through URL processing.
 */
export function getProductImageUrls(product) {
  if (!product) return [];
  // Use images array if available, otherwise fall back to single image
  const imageSources =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.image].filter(Boolean);
  return imageSources.map(getPublicImageUrl).filter(Boolean);
}

/**
 * Builds specifications array from a product object.
 * Uses product.specifications if available, otherwise builds
 * a default set from category, condition, stock, and status.
 */
export function buildSpecifications(product, stock) {
  if (product?.specifications && Object.keys(product.specifications).length > 0) {
    return Object.entries(product.specifications);
  }
  return [
    ['Category', product?.category || 'Not specified'],
    ['Condition', product?.condition || 'Not specified'],
    ['Stock', stock],
    ['Status', product?.status || 'Active'],
  ];
}

/**
 * Formats a price value for display using South African locale.
 * Adds thousand separators (e.g., 1234567 -> "1 234 567").
 */
export function formatPrice(value) {
  return Number(value || 0).toLocaleString(PRICE_LOCALE);
}

/**
 * Sanitizes error messages for safe display to users.
 * Returns generic messages to avoid leaking internal details.
 */
export function getSafeErrorMessage(error) {
  if (!error) return 'We could not find this product.';
  if (error.includes('not found') || error.includes('Not found')) {
    return 'We could not find this product.';
  }
  return 'Something went wrong. Please try again later.';
}
