/**
 * TR-Tech — Wishlist Page
 *
 * Displays the user's saved wishlist products with options to add to cart or remove.
 *
 * Features:
 * - Loading state with spinner while wishlist data is fetched
 * - Empty state with CTA to browse products
 * - Product grid with responsive columns (1-4 based on viewport)
 * - Each card shows image, name, price (with original price strikethrough if discounted)
 * - Add to Cart button (navigates to cart page after adding)
 * - Remove from wishlist button with loading spinner during removal
 *
 * State management:
 * - wishlist, removeFromWishlist, loading from WishlistContext
 * - addToCart from CartContext
 * - removingIds: Set tracking which items are currently being removed (for spinner)
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Plus } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../components/WishlistContext';
import { useCart } from '../components/CartContext';
import { getProductImageUrl } from '../lib/imageUrl';

export function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  // Track which product IDs are currently being removed (for spinner state)
  const [removingIds, setRemovingIds] = useState(new Set());

  useEffect(() => {
    if (loading) return;
  }, [loading]);

  // Remove item from wishlist with spinner feedback
  const handleRemove = async (product) => {
    const productId = product._id || product.id;
    setRemovingIds((prev) => new Set(prev).add(productId));
    try {
      await removeFromWishlist(product);
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Loading state: spinner while wishlist data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Navbar />
        <div className="flex-1 flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground text-sm">Loading wishlist...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="container mx-auto flex-1 px-4 max-w-6xl py-10">
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shop
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">My Wishlist</h1>
          {wishlist.length > 0 && (
            <span className="text-sm text-muted-foreground">({wishlist.length} items)</span>
          )}
        </div>

        {wishlist.length === 0 ? (
          // Empty state: prompt user to browse and save products
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
              <p className="text-muted-foreground mb-6">
                Save items you like by clicking the heart icon on any product.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-white text-primary border-2 border-black font-bold text-lg shadow-lg hover:bg-primary hover:text-white hover:border-primary hover:shadow-2xl transition-all duration-300 px-6 py-3 rounded-md"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          // Wishlist product grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                <Link to={`/products/${product._id || product.id}`} className="block">
                  <div className="relative bg-primary/5 aspect-[4/3]">
                    {product.image ? (
                      <img
                        src={getProductImageUrl(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover opacity-90"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-16 w-16 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-foreground leading-snug mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mt-auto">
                      <span className="text-base font-bold text-primary">
                        R{product.price?.toLocaleString() || 0}
                      </span>
                      {/* Show original price with strikethrough if discounted */}
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          R{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Add to Cart: adds item then navigates to cart page */}
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(product);
                        navigate('/cart');
                      }}
                      className="min-h-[48px] bg-primary text-white font-semibold text-sm rounded-md hover:bg-primary/90 transition-all duration-200 flex items-center justify-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add to Cart
                    </button>
                    {/* Remove from wishlist: shows spinner while removal is in progress */}
                    <button
                      type="button"
                      onClick={() => handleRemove(product)}
                      disabled={removingIds.has(product._id || product.id)}
                      className="min-h-[48px] bg-white text-red-600 border-2 border-red-300 font-semibold text-sm rounded-md hover:bg-red-50 hover:border-red-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center"
                    >
                      {removingIds.has(product._id || product.id) ? (
                        <div className="h-3 w-3 animate-spin rounded-full border-b-2 border-current" />
                      ) : (
                        <Heart className="h-4 w-4 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default WishlistPage;
