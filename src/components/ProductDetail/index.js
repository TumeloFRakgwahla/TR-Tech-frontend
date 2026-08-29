/**
 * ProductDetail Barrel Export
 *
 * Central export file for all ProductDetail components and utilities.
 * Allows for cleaner imports throughout the application.
 *
 * Usage:
 *   import { ImageGallery, ProductInfo, ProductTabs } from './components/ProductDetail';
 *
 * Exports:
 *   - ImageGallery: Product image gallery with thumbnails and swipe support
 *   - ProductInfo: Main product information display (price, stock, actions)
 *   - ProductTabs: Tabbed interface for description, specs, reviews, shipping
 *   - RelatedProductsSection: Grid of related products
 *   - RelatedProductCard: Individual related product card
 *   - StarRating: Star rating display component
 *   - getProductId: Extract product ID from object
 *   - getPublicImageUrl: Get processed image URL
 *   - getProductImageUrls: Build array of image URLs from product
 *   - buildSpecifications: Build specifications array from product
 *   - formatPrice: Format price for display (ZAR locale)
 *   - getSafeErrorMessage: Sanitize error messages for display
 */

export { ImageGallery } from './ImageGallery';
export { ProductInfo } from './ProductInfo';
export { ProductTabs } from './ProductTabs';
export { RelatedProductsSection, RelatedProductCard } from './RelatedProducts';
export { StarRating } from './StarRating';
export {
  getProductId,
  getPublicImageUrl,
  getProductImageUrls,
  buildSpecifications,
  formatPrice,
  getSafeErrorMessage,
} from './helpers';
