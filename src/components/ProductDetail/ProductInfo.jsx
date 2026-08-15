import { Star, Minus, Plus, ShoppingCart, Heart, Check, TruckIcon, Shield, RotateCcw } from 'lucide-react';
import { formatPrice } from './helpers';
import { useWishlist } from '../WishlistContext';

export function ProductInfo({
  product,
  price,
  originalPrice,
  discount,
  inStock,
  stock,
  rating,
  reviews,
  specifications,
  quantity,
  maxQuantity,
  onDecrease,
  onIncrease,
  onAddToCart,
  onBuyNow,
}) {
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product);
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {product.category && (
          <span className="text-xs border border-primary/20 bg-primary/10 text-primary px-2 py-1 rounded">
            {product.category}
          </span>
        )}
        {product.condition && (
          <span className="text-xs border border-border px-2 py-1 rounded">{product.condition}</span>
        )}
        {product.status && (
          <span className="text-xs border border-border px-2 py-1 rounded">{product.status}</span>
        )}
      </div>

      <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.name}</h1>

      {(rating > 0 || reviews > 0) && (
        <StarRating rating={rating} reviews={reviews} />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-foreground">
          R{formatPrice(price)}
        </span>
        {discount > 0 && (
          <>
            <span className="text-base text-muted-foreground line-through">
              R{formatPrice(originalPrice)}
            </span>
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">
              Save {discount}%
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {inStock ? (
          <>
            <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
            <span className="text-sm text-green-600 font-medium">
              In Stock ({stock} available)
            </span>
          </>
        ) : (
          <span className="text-sm text-red-500 font-medium">Out of Stock</span>
        )}
      </div>

      {product.description && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      )}

      {specifications.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Key Specifications
          </p>
          <div className="border border-border rounded-lg overflow-hidden">
            {specifications.slice(0, 4).map(([key, value], i) => (
              <div
                key={key}
                className={`grid grid-cols-1 md:grid-cols-[120px_1fr] text-sm px-4 py-2.5 ${
                  i % 2 === 0 ? 'bg-muted' : 'bg-white'
                }`}
              >
                <span className="text-muted-foreground">{key}:</span>
                <span className="text-foreground font-medium text-left">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-foreground mb-2" id="quantity-label">
          Quantity
        </p>
        <div
          className="inline-flex items-center border border-border rounded-md"
          role="group"
          aria-labelledby="quantity-label"
        >
          <button
            type="button"
            className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={onDecrease}
            disabled={!inStock}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="px-4 py-2 text-sm font-semibold border-x border-border min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            type="button"
            className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
            onClick={onIncrease}
            disabled={!inStock}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          className="flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-md border-2 border-black bg-white text-lg font-semibold text-primary shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!inStock}
          onClick={onAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          type="button"
          className={`min-h-[46px] w-[46px] flex items-center justify-center rounded-md border-2 border-black transition-colors disabled:opacity-40 ${
  inWishlist
    ? 'bg-red-50 text-red-500 hover:bg-red-100'
    : 'bg-white hover:bg-muted/30'
}`}
          disabled={!inStock}
          onClick={() => toggleWishlist(product)}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <button
        type="button"
        className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-md border-2 border-black bg-white text-lg font-semibold text-primary shadow-sm transition-all duration-200 hover:border-primary hover:bg-primary hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
        disabled={!inStock}
        onClick={onBuyNow}
      >
        Buy Now
      </button>

      <TrustBadges />
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border rounded-xl p-4 bg-muted">
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground" aria-hidden="true">
          <TruckIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Free Delivery</p>
          <p className="text-xs text-muted-foreground">On orders over R500</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground" aria-hidden="true">
          <Shield className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">2 Year Warranty</p>
          <p className="text-xs text-muted-foreground">Extended coverage included</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground" aria-hidden="true">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">30 Day Returns</p>
          <p className="text-xs text-muted-foreground">Hassle-free returns</p>
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating = 0, reviews = 0 }) {
  const rounded = Math.round(Number(rating || 0));
  return (
    <div className="flex items-center gap-2" aria-label={`${rounded} out of 5 stars`}>
      <div className="flex" role="img" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rounded
                ? 'fill-amber-400 text-amber-400'
                : 'fill-muted text-muted-foreground'
            }`}
          />
        ))}
      </div>
      {reviews > 0 && (
        <span className="text-sm text-muted-foreground">
          ({reviews} reviews)
        </span>
      )}
    </div>
  );
}
