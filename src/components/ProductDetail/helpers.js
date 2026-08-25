import { getProductImageUrl as getCanonicalProductImageUrl } from '../../lib/imageUrl';
const PRICE_LOCALE = 'en-ZA';

export function getProductId(product) {
  return product?._id || product?.id;
}

export { getCanonicalProductImageUrl as getProductImageUrl };

export function getPublicImageUrl(url) {
  return getCanonicalProductImageUrl(url);
}

export function getProductImageUrls(product) {
  if (!product) return [];
  const imageSources =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.image].filter(Boolean);
  return imageSources.map(getPublicImageUrl).filter(Boolean);
}

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

export function formatPrice(value) {
  return Number(value || 0).toLocaleString(PRICE_LOCALE);
}

export function getSafeErrorMessage(error) {
  if (!error) return 'We could not find this product.';
  if (error.includes('not found') || error.includes('Not found')) {
    return 'We could not find this product.';
  }
  return 'Something went wrong. Please try again later.';
}
