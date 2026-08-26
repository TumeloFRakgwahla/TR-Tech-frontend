import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Smartphone } from 'lucide-react';
import { productsAPI } from '../services/api';
import { getProductImageUrl } from '../lib/imageUrl';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';

function ProductCard({ product }) {
  const id = product._id || product.id;
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, isToggling } = useWishlist();
  const inWishlist = isInWishlist(product);
  const toggling = isToggling(product);

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col min-w-[160px] max-w-[180px]">
      <Link to={`/products/${id}`} className="block">
        <div className="relative bg-muted/50 aspect-square">
          {discount && (
            <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
              -{discount}%
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            }}
            disabled={toggling}
            className={`absolute top-2 right-2 z-10 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full transition-all ${
              toggling
                ? 'opacity-50 cursor-wait'
                : inWishlist
                ? 'bg-red-50 text-red-500'
                : 'bg-white/90 text-muted-foreground hover:text-red-500'
            }`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {toggling ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-b-2 border-current" />
            ) : (
              <Heart className={`h-3.5 w-3.5 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            )}
          </button>
          {product.image ? (
            <img
              src={getProductImageUrl(product.image)}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-primary/30" />
            </div>
          )}
        </div>

        <div className="p-2.5 flex flex-col flex-1">
          <h3 className="text-xs font-medium text-foreground leading-tight mb-1 line-clamp-2">
            {product.name}
          </h3>
          <div className="mt-auto">
            <span className="text-sm font-bold text-primary">
              R{product.price?.toLocaleString() || 0}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-muted-foreground line-through ml-1">
                R{product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="px-2.5 pb-2.5">
        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={!product.stock || product.stock === 0}
          className="w-full flex items-center justify-center gap-1 rounded-md border border-primary bg-white text-xs font-medium text-primary py-2 hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-3 w-3" />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add'}</span>
        </button>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border min-w-[160px] max-w-[180px] animate-pulse">
      <div className="aspect-square bg-muted/60" />
      <div className="p-2.5 space-y-2">
        <div className="h-3 bg-muted/60 rounded w-full" />
        <div className="h-3 bg-muted/60 rounded w-2/3" />
        <div className="h-4 bg-muted/60 rounded w-1/2 mt-2" />
      </div>
      <div className="px-2.5 pb-2.5">
        <div className="h-8 bg-muted/60 rounded w-full" />
      </div>
    </div>
  );
}

export default function ProductCarousel({ endpoint, emptyMessage }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      try {
        setLoading(true);
        const url = new URL(endpoint, window.location.origin);
        const params = Object.fromEntries(url.searchParams);
        const response = await productsAPI.getAll(params);
        if (!cancelled && response.success) {
          setProducts(response.data);
        }
      } catch {
        // Silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [endpoint]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!loading && products.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll buttons - hidden on mobile, visible on md+ */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow-lg rounded-full border border-border hover:bg-muted transition-colors"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-white shadow-lg rounded-full border border-border hover:bg-muted transition-colors"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Scrollable product list */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : products.map((product) => (
              <div key={product._id || product.id} className="snap-start">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </div>
  );
}
