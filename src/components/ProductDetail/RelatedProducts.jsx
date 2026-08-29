/**
 * RelatedProducts Component
 *
 * Displays a grid of related/similar products on the product detail page.
 * Each product is shown as a card with image, name, category, and price.
 *
 * Features:
 *   - Responsive grid layout (1-4 columns based on screen size)
 *   - Loading state indicator
 *   - Empty state message when no related products
 *   - Product cards with hover effects and image zoom
 *   - Fallback placeholder for products without images
 *   - Links to individual product detail pages
 *
 * Components:
 *   - RelatedProductsSection: Container with header and grid of product cards
 *   - RelatedProductCard: Individual product card with image, name, and price
 *
 * Props (RelatedProductsSection):
 *   - products: Array of product objects to display
 *   - loading: Boolean indicating if products are being fetched
 *
 * Props (RelatedProductCard):
 *   - product: Product object with _id, name, price, image, category
 */

import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { getProductId, getPublicImageUrl, formatPrice } from './helpers';

export function RelatedProductsSection({ products, loading }) {
  return (
    <div>
      {/* Section header with loading indicator */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">Related Products</h2>
        {loading && (
          <p className="text-xs text-muted-foreground">Loading...</p>
        )}
      </div>

      {/* Product grid or empty state */}
      {products.length > 0 ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          role="list"
        >
          {products.map((rel) => (
            <RelatedProductCard key={rel._id || rel.id} product={rel} />
          ))}
        </div>
      ) : (
        !loading && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            No related products available at the moment.
          </p>
        )
      )}
    </div>
  );
}

/**
 * RelatedProductCard Component
 *
 * Individual product card in the related products grid.
 * Displays product image, category, name, and price with a link
 * to the product detail page.
 */
export function RelatedProductCard({ product }) {
  // Extract product ID for URL generation
  const relId = getProductId(product);
  // Parse price as number for formatting
  const relPrice = Number(product.price || 0);
  // Get the public image URL for the product
  const relImg = getPublicImageUrl(product.image);

  return (
    <Link
      to={`/products/${relId}`}
      className="group flex h-full flex-col rounded-lg border border-border overflow-hidden bg-muted hover:shadow-md transition-shadow"
      role="listitem"
    >
      {/* Product image with hover zoom effect */}
      <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {relImg ? (
          <img
            src={relImg}
            alt={product.name}
            crossOrigin="anonymous"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Smartphone className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      {/* Product info - category, name, price */}
      <div className="p-3">
        <p className="text-xs text-muted-foreground mb-0.5">{product.category}</p>
        <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
          {product.name}
        </p>
        <p className="text-sm font-bold text-foreground mt-2">
          R{formatPrice(relPrice)}
        </p>
      </div>
    </Link>
  );
}
