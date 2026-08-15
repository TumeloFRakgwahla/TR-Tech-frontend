import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../components/WishlistContext';
import { productsAPI } from '../services/api';
import { getProductImageUrl } from '../lib/imageUrl';
import { toast } from 'sonner';

export function WishlistPage() {
  const { wishlist, removeFromWishlist, loading } = useWishlist();
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        setFetching(true);
        const wishlistIds = wishlist.map((item) => item._id || item.id);
        const response = await productsAPI.getAll();
        if (response.success) {
          const filtered = (response.data || []).filter((p) =>
            wishlistIds.includes(p._id || p.id)
          );
          setProducts(filtered);
        }
      } catch {
        toast.error('Failed to load wishlist products');
      } finally {
        setFetching(false);
      }
    };

    fetchProducts();
  }, [wishlist]);

  const handleRemove = async (product) => {
    await removeFromWishlist(product);
  };

  if (loading || fetching) {
    return (
      <div className="min-h-screen bg-muted">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
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
    <div className="min-h-screen bg-muted">
      <Navbar />
      <div className="container mx-auto px-4 max-w-6xl py-10">
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
          {products.length > 0 && (
            <span className="text-sm text-muted-foreground">({products.length} items)</span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20">
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
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
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-xs text-muted-foreground line-through">
                          R{product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
                <div className="px-4 pb-4">
                  <button
                    type="button"
                    onClick={() => handleRemove(product)}
                    className="w-full min-h-[40px] bg-white text-red-600 border-2 border-red-200 font-semibold text-sm rounded-md hover:bg-red-50 hover:border-red-300 transition-all duration-200"
                  >
                    Remove from Wishlist
                  </button>
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
