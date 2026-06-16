import { useEffect, useState } from 'react';
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

function getProductId(product) {
  return product?._id || product?.id;
}

function getPublicImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const baseUrl = API_BASE_URL.replace(/\/api$/, '');
  if (url.startsWith('/')) return `${baseUrl}${url}`;
  return `${baseUrl}/${url}`;
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString('en-ZA');
}

function getProductImageUrls(product) {
  if (!product) return [];
  const imageSources =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];
  return imageSources.map(getPublicImageUrl).filter(Boolean);
}

function StarRating({ rating = 0, reviews = 0 }) {
  const rounded = Math.round(Number(rating || 0));
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
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
        <span className="text-sm text-muted-foreground">({reviews} reviews)</span>
      )}
    </div>
  );
}

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

  const imageUrls = getProductImageUrls(product);
  const price = Number(product?.price || 0);
  const originalPrice = Number(product?.originalPrice || product?.compareAtPrice || 0);
  const discount = originalPrice > price ? Math.round((1 - price / originalPrice) * 100) : 0;
  const stock = Number(product?.stock ?? 0);
  const inStock = product?.inStock === undefined ? stock > 0 : product.inStock === true;
  const maxQuantity = Math.max(1, stock);
  const rating = Number(product?.rating || 0);
  const reviews = Number(product?.reviews || 0);
  const specifications = product?.specifications
    ? Object.entries(product.specifications)
    : [
        ['Category', product?.category || 'Not specified'],
        ['Condition', product?.condition || 'Not specified'],
        ['Stock', stock],
        ['Status', product?.status || 'Active'],
      ];

  useEffect(() => {
    let cancelled = false;
    async function fetchProduct() {
      try {
        setLoading(true);
        setError(null);
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
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    async function fetchRelated() {
      if (!product?.category) return;
      try {
        setRelatedLoading(true);
        const response = await productsAPI.getAll();
        if (!response.success || cancelled) return;
        const currentId = getProductId(product);
        setRelatedProducts(
          response.data
            .filter((item) => getProductId(item) !== currentId && item.category === product.category)
            .slice(0, 4)
        );
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        if (!cancelled) setRelatedLoading(false);
      }
    }
    fetchRelated();
    return () => { cancelled = true; };
  }, [product?.category, product?._id, product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground text-sm">Loading product details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="text-center max-w-sm">
            <h1 className="text-xl font-semibold mb-2">Product not found</h1>
            <p className="text-muted-foreground mb-6 text-sm">{error || 'We could not find this product.'}</p>
            <Link to="/shop">
              <Button className="bg-primary text-white hover:bg-primary/90">Back to Shop</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumb */}
      <div className="border-b border-border py-3">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-foreground">Shop</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main product section */}
      <div className="container mx-auto px-4 max-w-7xl py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <span aria-hidden="true">←</span>
            Back to Shop
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xl:gap-12 mb-12">

          {/* LEFT — Image gallery */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl overflow-hidden bg-gray-50 border border-border aspect-square flex items-center justify-center">
              {imageUrls[selectedImage] ? (
                <img
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Smartphone className="h-20 w-20 text-muted-foreground" />
              )}
            </div>

            {imageUrls.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imageUrls.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setSelectedImage(idx)}
                    className={`rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                      selectedImage === idx
                        ? 'border-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product info */}
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
              <div>
                <StarRating rating={rating} reviews={reviews} />
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-2xl font-bold text-foreground">R{formatPrice(price)}</span>
              {discount > 0 && (
                <>
                  <span className="text-base text-muted-foreground line-through">R{formatPrice(originalPrice)}</span>
                  <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-1 rounded">
                    Save {discount}%
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {inStock ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">In Stock ({stock} available)</span>
                </>
              ) : (
                <span className="text-sm text-red-500 font-medium">Out of Stock</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            {specifications.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-foreground mb-3">Key Specifications</p>
                <div className="border border-border rounded-lg overflow-hidden">
                  {specifications.slice(0, 4).map(([key, value], i) => (
                    <div
                      key={key}
                      className={`grid grid-cols-[120px_1fr] text-sm px-4 py-2.5 ${
                        i % 2 === 0 ? 'bg-gray-50' : 'bg-gray-50'
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
              <p className="text-sm font-medium text-foreground mb-2">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-md">
                <button
                  className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!inStock}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-4 py-2 text-sm font-semibold border-x border-border min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  className="px-3 py-2 text-muted-foreground hover:text-foreground disabled:opacity-40"
                  onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                  disabled={!inStock}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="min-h-[46px] flex-1 flex items-center justify-center gap-2 bg-primary text-white text-sm font-semibold px-5 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                disabled={!inStock}
                onClick={() => addToCart(product)}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                className="min-h-[46px] w-[46px] flex items-center justify-center border border-border rounded-md hover:bg-muted/30 transition-colors disabled:opacity-40"
                disabled={!inStock}
              >
                <Heart className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <button
              className="w-full min-h-[46px] bg-secondary hover:bg-secondary/90 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50"
              disabled={!inStock}
              onClick={() => addToCart(product)}
            >
              Buy Now
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground"><TruckIcon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Free Delivery</p>
                  <p className="text-xs text-muted-foreground">On orders over R500</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground"><Shield className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">2 Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Extended coverage included</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-muted-foreground"><RotateCcw className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">30 Day Returns</p>
                  <p className="text-xs text-muted-foreground">Hassle-free returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Card className="mb-14 rounded-xl border border-border bg-gray-50 shadow-sm">
          <Tabs defaultValue="description" className="p-6">
            <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0 bg-transparent gap-0">
              {[
                { value: 'description', label: 'Description' },
                { value: 'specifications', label: 'Specifications' },
                { value: 'reviews', label: `Reviews${reviews > 0 ? ` (${reviews})` : ''}` },
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
                <h3 className="text-base font-bold text-foreground mb-2">Product Description</h3>
                <p className="text-sm text-muted-foreground mb-4">{product.description || 'No description available.'}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This premium product combines cutting-edge technology with sleek design. Perfect for professionals and enthusiasts alike, it delivers exceptional performance and reliability. Every detail has been carefully crafted to provide the best user experience possible.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="mt-6">
              <div>
                <h3 className="text-base font-bold text-foreground mb-4">Technical Specifications</h3>
                <div className="border border-border rounded-lg overflow-hidden">
                  {specifications.map(([key, value], i) => (
                    <div
                      key={key}
                      className={`grid grid-cols-[140px_1fr] text-sm px-4 py-3 ${
                        i % 2 === 0 ? 'bg-gray-50' : 'bg-gray-50'
                      }`}
                    >
                      <span className="text-muted-foreground font-medium">{key}:</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div>
                <h3 className="text-base font-bold text-foreground mb-4">Customer Reviews</h3>
                <p className="text-sm text-muted-foreground">
                  {reviews > 0
                    ? `${reviews} review${reviews === 1 ? '' : 's'} for this product.`
                    : 'No reviews yet. Be the first to review this product!'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-3">
                <h3 className="text-base font-bold text-foreground mb-4">Shipping Information</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Delivery:</span> Contact TR-Tech for available delivery options and costs.
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Processing:</span> Orders are processed as soon as payment and delivery details are confirmed.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Related Products */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">Related Products</h2>
            {relatedLoading && <p className="text-xs text-muted-foreground">Loading...</p>}
          </div>

          {relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => {
                const relId = getProductId(rel);
                const relPrice = Number(rel.price || 0);
                const relImg = getPublicImageUrl(rel.image);

                return (
                  <Link
                    key={relId}
                    to={`/products/${relId}`}
                    className="group flex h-full flex-col rounded-lg border border-border overflow-hidden bg-gray-50 hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      {relImg ? (
                        <img
                          src={relImg}
                          alt={rel.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <Smartphone className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">{rel.category}</p>
                      <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">{rel.name}</p>
                      <p className="text-sm font-bold text-foreground mt-2">R{formatPrice(relPrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">No related products available at the moment.</p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ProductDetailPage;
