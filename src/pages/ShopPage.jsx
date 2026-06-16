import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Smartphone, Star, ShoppingCart, SlidersHorizontal, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartProvider, useCart } from '../components/CartContext';
import { CartDrawer } from '../components/CartDrawer';
import { productsAPI } from '../services/api';

function ShopContent() {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(30000);
  const [sortBy, setSortBy] = useState('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const categories = [
    'Smartphones', 'Laptops', 'Laptop Accessories',
    'Mobile Accessories', 'Gaming', 'Networking', 'Printers', 'Storage Devices'
  ];

  const brands = ['Apple', 'Samsung', 'HP', 'Dell', 'Lenovo', 'Asus'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        if (response.success) {
          setProducts(response.data);
          setImageErrors({});
        } else {
          setError(response.message);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceRange(30000);
    setSearchQuery('');
  };

  const filteredProducts = products.filter(product => {
    const catMatch = selectedCategories.length === 0 ||
      selectedCategories.some(c => product.category?.toLowerCase() === c.toLowerCase());
    const brandMatch = selectedBrands.length === 0 ||
      selectedBrands.some(b => product.brand?.toLowerCase() === b.toLowerCase());
    const priceMatch = (product.price || 0) <= priceRange;
    const stockMatch = !inStockOnly || (product.stock && product.stock > 0);
    const searchMatch = searchQuery.trim() === '' ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return catMatch && brandMatch && priceMatch && stockMatch && searchMatch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const getDiscountPercent = (product) => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return null;
  };

  const renderStars = (rating) => (
    [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < Math.floor(rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
      />
    ))
  );

  const Sidebar = () => (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-foreground">Filters</h2>
        <button
          onClick={clearAll}
          className="text-sm text-primary hover:text-primary/80 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
        <div className="space-y-2">
          {categories.map(cat => (
            <label key={cat} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-primary">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Price Range</h3>
        <input
          type="range"
          min={0}
          max={30000}
          step={100}
          value={priceRange}
          onChange={e => setPriceRange(Number(e.target.value))}
          className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>R0</span>
          <span>R{priceRange.toLocaleString()}</span>
        </div>
      </div>

      {/* Brands */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map(brand => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
              />
              <span className="text-sm text-foreground group-hover:text-primary">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={e => setInStockOnly(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
          />
          <span className="text-sm text-foreground group-hover:text-primary">In Stock Only</span>
        </label>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Tech Shop</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Quality tech products and accessories for all your technology needs.
            </p>
          </div>
        </section>

        {/* Top bar */}
        <div className="bg-white/95 border-b border-border px-4 py-3 backdrop-blur">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between">
            <button
              className="md:hidden flex items-center gap-2 text-sm font-medium text-primary"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <p className="text-sm text-muted-foreground hidden md:block">
              Showing <span className="font-medium text-primary">{sortedProducts.length}</span> products
            </p>

            {/* Search bar */}
            <div className="relative flex-1 max-w-sm mx-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-9 pr-8 py-1.5 text-sm border border-border rounded-md bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <label className="text-sm text-muted-foreground">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-md px-3 py-1.5 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-6">
          <div className="flex gap-6">

            {/* Sidebar – desktop */}
            <aside className="hidden md:block w-56 flex-shrink-0">
              <Sidebar />
            </aside>

            {/* Mobile filters overlay */}
            {mobileFiltersOpen && (
              <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setMobileFiltersOpen(false)}>
                <div
                  className="absolute left-0 top-0 h-full w-72 bg-white overflow-y-auto p-4"
                  onClick={e => e.stopPropagation()}
                >
                  <Sidebar />
                </div>
              </div>
            )}

            {/* Products grid */}
            <main className="flex-1 min-w-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading products...</p>
                </div>
              ) : error ? (
                <div className="text-center py-24">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90"
                  >
                    Retry
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground">No products match your filters.</p>
                  <button onClick={clearAll} className="mt-3 text-primary text-sm hover:underline">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {sortedProducts.map((product) => {
                    const discount = getDiscountPercent(product);
                    const id = product._id || product.id;
                    const isFlashDeal = discount && discount >= 7;

                    return (
                      <div
                        key={id}
                        className="bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col"
                      >
                        <Link to={`/products/${id}`} className="block">
                          {/* Image area */}
                          <div className="relative bg-primary/5 aspect-[4/3]">
                            {discount && (
                              <span className="absolute top-2 left-2 z-10 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{discount}%
                              </span>
                            )}
                            {isFlashDeal && (
                              <span className="absolute top-7 left-2 z-10 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded mt-1">
                                Flash Deal
                              </span>
                            )}
                            {product.image && !imageErrors[id] ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover opacity-90"
                                onError={() => setImageErrors(prev => ({ ...prev, [id]: true }))}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Smartphone className="h-16 w-16 text-primary/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="p-3 flex flex-col flex-1">
                            {product.category && (
                              <p className="text-xs text-primary/70 mb-0.5">{product.category}</p>
                            )}
                            <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Stars + review count */}
                            <div className="flex items-center gap-1 mb-2">
                              <div className="flex">{renderStars(product.rating)}</div>
                              {product.reviews > 0 && (
                                <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
                              )}
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline gap-2 mb-3 mt-auto">
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

                        {/* Add to Cart */}
                        <div className="px-3 pb-3">
                          <button
                            type="button"
                            onClick={() => addToCart(product)}
                            disabled={!product.stock || product.stock === 0}
                            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      {/* Trust Section */}
        <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Quality Assured</h4>
              <p className="text-sm text-gray-600">
                All products tested and verified
              </p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Warranty Included</h4>
              <p className="text-sm text-gray-600">
                Every purchase comes with warranty
              </p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Secure Checkout</h4>
              <p className="text-sm text-gray-600">
                Safe and convenient WhatsApp checkout
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const Shop = () => <ShopContent />;

export default Shop;