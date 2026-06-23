import { useEffect, useMemo, useState, useCallback } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  TruckIcon,
  Shield,
  RotateCcw,
  Check,
  Smartphone,
} from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../components/CartContext';
import { Link, useParams } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const RELATED_PRODUCTS_LIMIT = 4;
const PRICE_LOCALE = 'en-ZA';

export function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const imageUrls = useMemo(() => getProductImageUrls(product), [product]);
  const price = useMemo(() => Number(product?.price || 0), [product]);
  const originalPrice = useMemo(
    () => Number(product?.originalPrice || product?.compareAtPrice || 0),
    [product]
  );
  const discount = useMemo(
    () => (originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0),
    [originalPrice, price]
  );
  const stock = useMemo(() => Number(product?.stock ?? 0), [product]);
  const inStock = useMemo(
    () => (product?.inStock === undefined ? stock > 0 : product.inStock === true),
    [product, stock]
  );
  const maxQuantity = useMemo(() => Math.max(1, stock), [stock]);
  const rating = useMemo(() => Number(product?.rating || 0), [product]);
  const reviews = useMemo(() => Number(product?.reviews || 0), [product]);
  const specifications = useMemo(() => buildSpecifications(product, stock), [product, stock]);

  const currentImageUrl = imageUrls[selectedImage] || '';

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

  useEffect(() => {
    let cancelled = false;
    async function fetchRelated() {
      if (!product?.category) return;
      try {
        setRelatedLoading(true);
        const response = await productsAPI.getRelated?.(product.category, product._id || product.id, RELATED_PRODUCTS_LIMIT);
        if (response?.success && !cancelled) {
          setRelatedProducts(response.data);
          return;
        }
      } catch {
        // Fallback: if dedicated endpoint not available, do NOT fetch all products.
        // Related products will simply not display — prefer empty state over N+1 fetch.
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }
    fetchRelated();
    return () => {
      cancelled = true;
    };
  }, [product?.category, product?._id, product?.id]);

  const handleImageError = useCallback((url) => {
    setImageErrors((prev) => ({ ...prev, [url]: true }));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!inStock || !product) return;
    addToCart(product, quantity);
  }, [inStock, product, quantity, addToCart]);

  const handleBuyNow = useCallback(() => {
    if (!inStock || !product) return;
    addToCart(product, quantity);
    // TODO: Navigate to checkout when route is available
    // navigate('/checkout');
  }, [inStock, product, quantity, addToCart]);

  const handleWishlist = useCallback(() => {
    // TODO: Implement wishlist functionality
    console.log('Wishlist clicked for:', product?.name);
  }, [product]);

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
              <Button className="bg-primary text-white hover:bg-primary/90">
                Back to Shop
              </Button>
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

      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="mb-6">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-12">
          {/* Image Gallery */}
          <ImageGallery
            imageUrls={imageUrls}
            selectedImage={selectedImage}
            onSelect={setSelectedImage}
            productName={product.name}
            imageErrors={imageErrors}
            onImageError={handleImageError}
          />

          {/* Product Info */}
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
            onQuantityChange={setQuantity}
            onDecrease={decreaseQuantity}
            onIncrease={increaseQuantity}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onWishlist={handleWishlist}
          />
        </div>

        {/* Tabs */}
        <ProductTabs product={product} specifications={specifications} reviews={reviews} />

        {/* Related Products */}
        <RelatedProductsSection
          products={relatedProducts}
          loading={relatedLoading}
        />
      </div>
    </PageShell>
  );
}

function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

function ImageGallery({
  imageUrls,
  selectedImage,
  onSelect,
  productName,
  imageErrors,
  onImageError,
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl overflow-hidden bg-gray-50 border border-border aspect-square flex items-center justify-center">
        {imageUrls[selectedImage] && !imageErrors[imageUrls[selectedImage]] ? (
          <img
            src={imageUrls[selectedImage]}
            alt={`${productName} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover"
            onError={() => onImageError(imageUrls[selectedImage])}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Smartphone className="h-20 w-20 text-muted-foreground" aria-hidden="true" />
        )}
      </div>

      {imageUrls.length > 1 && (
        <div className="grid grid-cols-4 gap-2" role="listbox" aria-label="Product images">
          {imageUrls.map((img, idx) => (
            <button
              key={img}
              type="button"
              role="option"
              aria-selected={selectedImage === idx}
              aria-label={`View image ${idx + 1}`}
              onClick={() => onSelect(idx)}
              className={`rounded-lg overflow-hidden border-2 transition-all aspect-square focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                selectedImage === idx
                  ? 'border-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <img
                src={img}
                alt={`${productName} thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={() => onImageError(img)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductInfo({
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
  onQuantityChange,
  onDecrease,
  onIncrease,
  onAddToCart,
  onBuyNow,
  onWishlist,
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-2">
        {product.category && (
          <Badge variant="outline" className="text-xs border-primary/20 bg-primary/10 text-primary">
            {product.category}
          </Badge>
        )}
        {product.condition && (
          <Badge variant="outline" className="text-xs">{product.condition}</Badge>
        )}
        {product.status && (
          <Badge variant="outline" className="text-xs">{product.status}</Badge>
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
                className={`grid grid-cols-[120px_1fr] text-sm px-4 py-2.5 ${
                  i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
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
          className="min-h-[46px] flex-1 flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          disabled={!inStock}
          onClick={onAddToCart}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          type="button"
          className="min-h-[46px] w-[46px] flex items-center justify-center border border-border rounded-md hover:bg-muted/30 transition-colors disabled:opacity-40"
          disabled={!inStock}
          onClick={onWishlist}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <button
        type="button"
        className="w-full min-h-[46px] bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border rounded-xl p-4 bg-gray-50">
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

function ProductTabs({ product, specifications, reviews }) {
  return (
    <Card className="mb-14 rounded-xl border border-border bg-gray-50 shadow-sm">
      <Tabs defaultValue="description" className="p-6">
        <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-0">
          {[
            { value: 'description', label: 'Description' },
            { value: 'specifications', label: 'Specifications' },
            {
              value: 'reviews',
              label: `Reviews${reviews > 0 ? ` (${reviews})` : ''}`,
            },
            { value: 'shipping', label: 'Shipping' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent px-5 pb-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-muted/30 bg-transparent shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="description" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-2">
              Product Description
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {product.description || 'No description available.'}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This premium product combines cutting-edge technology with sleek
              design. Perfect for professionals and enthusiasts alike, it delivers
              exceptional performance and reliability. Every detail has been
              carefully crafted to provide the best user experience possible.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">
              Technical Specifications
            </h3>
            <div className="border border-border rounded-lg overflow-hidden">
              {specifications.map(([key, value], i) => (
                <div
                  key={key}
                  className={`grid grid-cols-[140px_1fr] text-sm px-4 py-3 ${
                    i % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  }`}
                >
                  <span className="text-muted-foreground font-medium">
                    {key}:
                  </span>
                  <span className="text-foreground">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <div>
            <h3 className="text-base font-bold text-foreground mb-4">
              Customer Reviews
            </h3>
            <p className="text-sm text-muted-foreground">
              {reviews > 0
                ? `${reviews} review${reviews === 1 ? '' : 's'} for this product.`
                : 'No reviews yet. Be the first to review this product!'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <div className="space-y-3">
            <h3 className="text-base font-bold text-foreground mb-4">
              Shipping Information
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Delivery:</span>{' '}
              Contact TR-Tech for available delivery options and costs.
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Processing:</span>{' '}
              Orders are processed as soon as payment and delivery details are
              confirmed.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

function RelatedProductsSection({ products, loading }) {
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

function RelatedProductCard({ product }) {
  const relId = getProductId(product);
  const relPrice = Number(product.price || 0);
  const relImg = getPublicImageUrl(product.image);

  return (
    <Link
      to={`/products/${relId}`}
      className="group flex h-full flex-col rounded-lg border border-border overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
      role="listitem"
    >
      <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
        {relImg ? (
          <img
            src={relImg}
            alt={product.name}
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

export function getProductId(product) {
  return product?._id || product?.id;
}

function getPublicImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function getProductImageUrls(product) {
  if (!product) return [];
  const imageSources =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter(Boolean)
      : [product.image].filter(Boolean);
  return imageSources.map(getPublicImageUrl).filter(Boolean);
}

function buildSpecifications(product, stock) {
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

function formatPrice(value) {
  return Number(value || 0).toLocaleString(PRICE_LOCALE);
}

function getSafeErrorMessage(error) {
  if (!error) return 'We could not find this product.';
  if (error.includes('not found') || error.includes('Not found')) {
    return 'We could not find this product.';
  }
  return 'Something went wrong. Please try again later.';
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

export default ProductDetailPage;
