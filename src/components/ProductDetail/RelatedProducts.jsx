import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { getProductId, getPublicImageUrl, formatPrice } from './helpers';

export function RelatedProductsSection({ products, loading }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-foreground">Related Products</h2>
        {loading && (
          <p className="text-xs text-muted-foreground">Loading...</p>
        )}
      </div>

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

export function RelatedProductCard({ product }) {
  const relId = getProductId(product);
  const relPrice = Number(product.price || 0);
  const relImg = getPublicImageUrl(product.image);

  return (
    <Link
      to={`/products/${relId}`}
      className="group flex h-full flex-col rounded-lg border border-border overflow-hidden bg-muted hover:shadow-md transition-shadow"
      role="listitem"
    >
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
