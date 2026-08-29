/**
 * TR-Tech — Product Detail Page
 *
 * Full product view with image gallery, product info, tabs, and related products.
 *
 * Features:
 * - Dynamic product loading by ID from URL params
 * - Image gallery with thumbnail selection and error handling
 * - Price display with discount calculation and original/compare-at price
 * - Stock status and quantity selector with min/max constraints
 * - Add to Cart and Buy Now actions (Buy Now redirects to checkout)
 * - Product tabs for description, specifications, and reviews
 * - Related products section filtered by same category
 * - Sticky mobile Add to Cart bar positioned above BottomNav
 *
 * Data flow:
 * 1. Product fetched by ID on mount (with cancellation support)
 * 2. Related products fetched after main product loads
 * 3. Multiple memoized derived values (price, discount, stock, specs)
 * 4. Loading/error/empty states handled with appropriate UI
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useCart } from '../components/CartContext';
import {
  ImageGallery,
  ProductInfo,
  ProductTabs,
  RelatedProductsSection,
  getProductImageUrls,
  buildSpecifications,
  getSafeErrorMessage,
} from '../components/ProductDetail';

export function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Product state
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  // Related products state
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Derived values via useMemo for performance
  const imageUrls = useMemo(() => getProductImageUrls(product), [product]);
  const price = useMemo(() => Number(product?.price || 0), [product]);
  const originalPrice = useMemo(
    () => Number(product?.originalPrice || product?.compareAtPrice || 0),
    [product]
  );
  // Calculate discount percentage if original price is higher
  const discount = useMemo(
    () => (originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0),
    [originalPrice, price]
  );
  const stock = useMemo(() => Number(product?.stock ?? 0), [product]);
  const inStock = useMemo(
    () => (product?.inStock !== undefined ? product.inStock : stock > 0),
    [product, stock]
  );
  const maxQuantity = useMemo(() => Math.max(1, stock), [stock]);
  const rating = useMemo(() => Number(product?.rating || 0), [product]);
  const reviews = useMemo(() => Number(product?.reviews || 0), [product]);
  const specifications = useMemo(() => buildSpecifications(product, stock), [product, stock]);

  // Fetch product by ID with cancellation support to prevent state updates on unmounted component
  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
        setImageErrors({});
        const response = await productsAPI.getById(id);
        if (!response.success) throw new Error(response.message || 'Product not found');
        if (!cancelled) {
          setProduct(response.data);
          setQuantity(1);
          setSelectedImage(0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load product');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Fetch related products by category (excluding current product)
  useEffect(() => {
    let cancelled = false;
    async function fetchRelated() {
      if (!product?.category) return;
      try {
        setRelatedLoading(true);
        const response = await productsAPI.getAll({ category: product.category, status: 'Active' });
        if (!cancelled && response.success) {
          const related = (response.data || [])
            .filter((p) => p._id !== product._id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch {
        // Silently fail related products fetch
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }
    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [product?._id, product?.category]);

  // Track image load errors to show fallback
  const handleImageError = useCallback((url) => {
    setImageErrors((prev) => ({ ...prev, [url]: true }));
  }, []);

  // Add current product with selected quantity to cart
  const handleAddToCart = useCallback(() => {
    if (!inStock || !product) return;
    addToCart(product, quantity);
  }, [inStock, product, quantity, addToCart]);

  // Add to cart then redirect to checkout page
  const handleBuyNow = useCallback(() => {
    if (!inStock || !product) return;
    addToCart(product, quantity);
    navigate('/checkout');
  }, [inStock, product, quantity, addToCart, navigate]);

  // Quantity controls with min/max constraints
  const decreaseQuantity = useCallback(() => {
    setQuantity((q) => Math.max(1, q - 1));
  }, []);

  const increaseQuantity = useCallback(() => {
    setQuantity((q) => Math.min(maxQuantity, q + 1));
  }, [maxQuantity]);

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground text-sm">Loading product details...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error || !product) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-semibold mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-6 text-sm">
              {getSafeErrorMessage(error)}
            </p>
            <Link to="/shop">
              <button className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded">
                Back to Shop
              </button>
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-foreground">Home</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link to="/shop" className="hover:text-foreground">Shop</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground" aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-7xl py-6 md:py-10 pb-32 md:pb-10">
        <div className="mb-4 md:mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground min-h-[44px]"
          >
            <span aria-hidden="true">←</span>
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 xl:gap-12 mb-8 md:mb-12">
          <ImageGallery
            imageUrls={imageUrls}
            selectedImage={selectedImage}
            onSelect={setSelectedImage}
            productName={product.name}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />

          <ProductInfo
            product={product}
            price={price}
            originalPrice={originalPrice}
            discount={discount}
            inStock={inStock}
            stock={stock}
            rating={rating}
            reviews={reviews}
            specifications={specifications}
            quantity={quantity}
            maxQuantity={maxQuantity}
            onDecrease={decreaseQuantity}
            onIncrease={increaseQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>

        <ProductTabs product={product} specifications={specifications} reviews={reviews} />

        <RelatedProductsSection
          products={relatedProducts}
          loading={relatedLoading}
        />
      </div>

      {/* Mobile: Sticky Add to Cart - positioned above bottom nav */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 bg-background border-t border-border p-3 z-30 shadow-lg">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
          <div>
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="text-lg font-bold text-primary">R{price.toFixed(2)}</p>
          </div>
          <div className="flex gap-2 flex-1 max-w-xs">
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 bg-white border-2 border-primary text-primary font-semibold px-4 py-3 rounded-md min-h-[48px] disabled:opacity-50 transition-all"
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="flex-1 bg-primary text-white font-semibold px-4 py-3 rounded-md min-h-[48px] disabled:opacity-50 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default ProductDetailPage;

// Page shell wrapper providing consistent layout (Navbar, Footer, BottomNav)
function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-muted">
      <Navbar />
      {children}
      <Footer />
      <BottomNav />
    </div>
  );
}
