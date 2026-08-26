import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import { Smartphone, ShoppingCart, SlidersHorizontal, Search, X, Heart, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useWishlist } from '../components/WishlistContext';
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api';
import { getProductImageUrl } from '../lib/imageUrl';
import { StarRating } from '../components/ProductDetail';
import { FALLBACK_CATEGORIES, FALLBACK_BRANDS, SORT_OPTIONS } from '../constants';

const PRICE_STEP = 100;

function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function useFilters(maxPrice = 30000) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(maxPrice);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  const toggleBrand = useCallback((brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }, []);

  const clearAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceRange(maxPrice);
    setSearchQuery('');
  }, [maxPrice]);

  const activeFilterCount = useMemo(() => (
    selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (priceRange < maxPrice ? 1 : 0)
  ), [selectedCategories, selectedBrands, inStockOnly, priceRange, maxPrice]);

  return {
    selectedCategories, toggleCategory,
    selectedBrands, toggleBrand,
    inStockOnly, setInStockOnly,
    priceRange, setPriceRange,
    searchQuery, setSearchQuery, debouncedSearchQuery,
    clearAll, activeFilterCount,
    isFiltered: activeFilterCount > 0,
    maxPrice,
  };
}

function ProductCard({ product, imageErrors, setImageErrors, addToCart }) {
  const id = product._id || product.id;
  const discount = useMemo(() => {
    if (product.originalPrice && product.originalPrice > product.price) {
      return Math.round((1 - product.price / product.originalPrice) * 100);
    }
    return null;
  }, [product.originalPrice, product.price]);

  const handleImageError = useCallback(() => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  }, [id, setImageErrors]);

  const { toggleWishlist, isInWishlist, isToggling } = useWishlist();
  const inWishlist = isInWishlist(product);
  const toggling = isToggling(product);

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col">
      <Link to={`/products/${id}`} className="block">
        <div className="relative bg-primary/5 aspect-[4/3]">
          {discount && (
            <span className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {discount && discount >= 70 && (
            <span className="absolute top-7 left-2 z-10 bg-secondary text-white text-xs font-semibold px-2 py-1 rounded mt-1">
              Flash Deal
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
            className={`absolute top-2 right-2 z-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full border transition-all ${
              toggling
                ? 'opacity-50 cursor-wait'
                : inWishlist
                ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                : 'bg-white/90 border-border text-muted-foreground hover:text-red-500 hover:border-red-200'
            }}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={inWishlist}
          >
            {toggling ? (
              <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current" />
            ) : (
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-red-500 text-red-500' : ''}`} />
            )}
          </button>
          {product.image && !imageErrors[id] ? (
            <img
              src={getProductImageUrl(product.image)}
              alt={`${product.name} product image`}
              className="w-full h-full object-cover opacity-90"
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Smartphone className="h-16 w-16 text-primary/40" aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="p-3 flex flex-col flex-1">
          {product.category && (
            <p className="text-xs text-primary/70 mb-0.5">{product.category}</p>
          )}
          <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-2" aria-label={`${product.rating || 0} out of 5 stars`}>
            <StarRating rating={product.rating} reviews={product.reviews} size={3} />
          </div>

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

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={!product.stock || product.stock === 0}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border-2 border-primary bg-white text-lg font-semibold text-primary shadow-sm transition-all duration-200 hover:bg-primary hover:text-white hover:shadow-md disabled:cursor-not-allowed disabled:border-muted disabled:bg-muted disabled:text-muted-foreground"
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          <span>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-border shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-muted/60" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-muted/60 rounded w-1/3" />
        <div className="h-4 bg-muted/60 rounded w-full" />
        <div className="h-4 bg-muted/60 rounded w-2/3" />
        <div className="h-3 bg-muted/60 rounded w-1/4 mt-2" />
        <div className="h-5 bg-muted/60 rounded w-1/3" />
      </div>
      <div className="px-3 pb-3">
        <div className="h-11 bg-muted/60 rounded w-full" />
      </div>
    </div>
  );
}

function FilterChips({ filters }) {
  const quickFilters = [
    { label: 'In Stock', active: filters.inStockOnly, toggle: () => filters.setInStockOnly(!filters.inStockOnly) },
    { label: 'Under R1000', active: filters.priceRange <= 1000, toggle: () => filters.setPriceRange(filters.priceRange <= 1000 ? filters.maxPrice : 1000) },
    { label: 'Top Rated', active: false, toggle: () => {} },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {quickFilters.map((filter) => (
        <button
          key={filter.label}
          onClick={filter.toggle}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[36px] ${
            filter.active
              ? 'bg-primary text-white'
              : 'bg-muted text-foreground hover:bg-muted/80'
          }`}
        >
          {filter.label}
        </button>
      ))}
      {filters.activeFilterCount > 0 && (
        <button
          onClick={filters.clearAll}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all min-h-[36px]"
        >
          Clear All
        </button>
      )}
    </div>
  );
}

function FilterSidebar({ filters, maxPrice, categories, brands }) {
  const {
    selectedCategories, toggleCategory,
    selectedBrands, toggleBrand,
    inStockOnly, setInStockOnly,
    priceRange, setPriceRange,
    clearAll, isFiltered,
  } = filters;

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    stock: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [priceInputValue, setPriceInputValue] = useState(priceRange);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  useEffect(() => {
    if (!isEditingPrice) {
      setPriceInputValue(priceRange);
    }
  }, [priceRange, isEditingPrice]);

  const handlePriceInputChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPriceInputValue(value ? Number(value) : 0);
  };

  const handlePriceInputBlur = () => {
    setIsEditingPrice(false);
    setPriceRange(Math.min(Math.max(0, priceInputValue), maxPrice));
  };

  const handlePriceInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  const totalActiveFilters = selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (priceRange < maxPrice ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Filters</h2>
              {totalActiveFilters > 0 && (
                <p className="text-[11px] text-muted-foreground">{totalActiveFilters} active</p>
              )}
            </div>
          </div>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Pills */}
      {isFiltered && (
        <div className="px-5 py-3 border-b border-border/50 bg-muted/20">
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map(cat => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
              >
                {cat}
                <button
                  onClick={() => toggleCategory(cat)}
                  className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${cat} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {selectedBrands.map(brand => (
              <span
                key={brand}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary"
              >
                {brand}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="ml-0.5 hover:bg-secondary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${brand} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                In Stock
                <button
                  onClick={() => setInStockOnly(false)}
                  className="ml-0.5 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remove in stock filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="divide-y divide-border/50">
        {/* Categories Section */}
        <div className="px-5 py-4">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between group"
            aria-expanded={expandedSections.categories}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Categories</span>
              {selectedCategories.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.categories ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.categories ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-0 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
              {categories.map(cat => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <label
                    key={cat}
                    className={`flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-md transition-all ${
                      isSelected ? 'bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCategory(cat)}
                        className="sr-only peer"
                      />
                      <div className={`w-[16px] h-[16px] rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/40 group-hover:border-primary/60'
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm transition-colors ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Brands Section */}
        <div className="px-5 py-4">
          <button
            onClick={() => toggleSection('brands')}
            className="w-full flex items-center justify-between group"
            aria-expanded={expandedSections.brands}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Brands</span>
              {selectedBrands.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedBrands.length}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.brands ? 'max-h-64 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-0 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent pr-1">
              {brands.map(brand => {
                const isSelected = selectedBrands.includes(brand);
                return (
                  <label
                    key={brand}
                    className={`flex items-center gap-3 cursor-pointer group py-1.5 px-2 rounded-md transition-all ${
                      isSelected ? 'bg-secondary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleBrand(brand)}
                        className="sr-only peer"
                      />
                      <div className={`w-[16px] h-[16px] rounded border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-secondary border-secondary'
                          : 'border-muted-foreground/40 group-hover:border-secondary/60'
                      }`}>
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <span className={`text-sm transition-colors ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground group-hover:text-foreground'}`}>
                      {brand}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Price Range Section */}
        <div className="px-5 py-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between group"
            aria-expanded={expandedSections.price}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Price Range</span>
              {priceRange < maxPrice && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.price ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="px-4">
              {/* Price Range Display */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Min</span>
                  <div className="mt-1 px-3 py-1.5 bg-muted/40 rounded-md text-sm font-semibold text-foreground min-w-[70px]">
                    R0
                  </div>
                </div>
                <div className="flex-1 mx-3 mt-4">
                  <div className="h-px bg-border" />
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Max</span>
                  <div
                    className="mt-1 px-3 py-1.5 bg-muted/40 rounded-md text-sm font-semibold text-primary min-w-[70px] cursor-pointer hover:bg-primary/10 hover:ring-2 hover:ring-primary/20 transition-all"
                    onClick={() => setIsEditingPrice(true)}
                  >
                    {isEditingPrice ? (
                      <input
                        type="text"
                        value={priceInputValue}
                        onChange={handlePriceInputChange}
                        onBlur={handlePriceInputBlur}
                        onKeyDown={handlePriceInputKeyDown}
                        className="w-full bg-transparent text-center outline-none text-primary font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span>R{priceRange.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Range Slider */}
              <div className="relative h-8 flex items-center">
                {/* Track Background */}
                <div className="absolute inset-x-0 h-2 bg-muted rounded-full" />
                
                {/* Active Track */}
                <div
                  className="absolute h-2 bg-gradient-to-r from-primary via-primary to-primary/70 rounded-full transition-all"
                  style={{ width: `${(priceRange / maxPrice) * 100}%` }}
                />
                
                {/* Slider Input */}
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={PRICE_STEP}
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="absolute inset-x-0 w-full h-8 opacity-0 cursor-pointer z-10"
                  aria-label="Maximum price"
                  aria-valuemin={0}
                  aria-valuemax={maxPrice}
                  aria-valuenow={priceRange}
                />
                
                {/* Slider Thumb */}
                <div
                  className="absolute w-6 h-6 bg-white border-[3px] border-primary rounded-full shadow-lg -translate-x-1/2 pointer-events-none transition-transform hover:scale-110"
                  style={{ left: `${(priceRange / maxPrice) * 100}%` }}
                />
              </div>

              {/* Price Scale Labels */}
              <div className="flex justify-between mt-2 px-0.5">
                <span className="text-[10px] text-muted-foreground">R0</span>
                <span className="text-[10px] text-muted-foreground">R{Math.round(maxPrice / 2).toLocaleString()}</span>
                <span className="text-[10px] text-muted-foreground">R{maxPrice.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Availability Section */}
        <div className="px-5 py-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={e => setInStockOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 rounded-full transition-all ${
                  inStockOnly ? 'bg-primary' : 'bg-muted'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                    inStockOnly ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">In Stock Only</span>
                <p className="text-[11px] text-muted-foreground">Hide out of stock items</p>
              </div>
            </div>
            {inStockOnly && (
              <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium">
                On
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isFiltered ? (
              <span><span className="font-medium text-foreground">{totalActiveFilters}</span> filters applied</span>
            ) : (
              'No filters active'
            )}
          </p>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


function ShopContent() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  const initialCategory = searchParams.get('category');
  const initialBrand = searchParams.get('brand');

  const filters = useFilters(30000);

  const maxPrice = useMemo(() => {
    const max = products.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0);
    return max > 0 ? max : 30000;
  }, [products]);

  const fetchCategoriesAndBrands = useCallback(async () => {
    const [catRes, brandRes] = await Promise.allSettled([
      categoriesAPI.getActive(),
      brandsAPI.getActive(),
    ]);

    if (catRes.status === 'fulfilled' && catRes.value.success) {
      const catNames = (catRes.value.data || []).map((c) => c.name);
      setCategories(catNames.length ? [...new Set(catNames)] : FALLBACK_CATEGORIES);
    } else {
      setCategories(FALLBACK_CATEGORIES);
    }

    if (brandRes.status === 'fulfilled' && brandRes.value.success) {
      const brandNames = (brandRes.value.data || []).map((b) => b.name);
      setBrands(brandNames.length ? [...new Set(brandNames)] : FALLBACK_BRANDS);
    } else {
      setBrands(FALLBACK_BRANDS);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll();

      if (data.success) {
        setProducts(data.data);
        setImageErrors({});
      } else {
        setError('Unable to load products. Please check your connection and try again.');
      }
    } catch {
      setError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [fetchProducts, fetchCategoriesAndBrands]);

  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const match = categories.find(c => c.toLowerCase() === initialCategory.toLowerCase());
      if (match && !filters.selectedCategories.includes(match)) {
        filters.toggleCategory(match);
      }
    }
  }, [initialCategory, categories, filters]);

  useEffect(() => {
    if (initialBrand && brands.length > 0) {
      const match = brands.find(b => b.toLowerCase() === initialBrand.toLowerCase());
      if (match && !filters.selectedBrands.includes(match)) {
        filters.toggleBrand(match);
      }
    }
  }, [initialBrand, brands, filters]);

  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProducts]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'categories' || e.detail?.type === 'brands') {
        fetchCategoriesAndBrands();
      } else {
        fetchProducts();
      }
    };
    window.addEventListener('admin-data-changed', handler);
    return () => window.removeEventListener('admin-data-changed', handler);
  }, [fetchProducts, fetchCategoriesAndBrands]);

  useEffect(() => {
    if (!loading && products.length > 0) {
      filters.setPriceRange(maxPrice);
    }
  }, [loading, products.length, maxPrice, filters]);

  const retryFetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Use debounced search for filtering
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const catMatch = filters.selectedCategories.length === 0 ||
        filters.selectedCategories.some(c => product.category?.toLowerCase() === c.toLowerCase());
      const brandMatch = filters.selectedBrands.length === 0 ||
        filters.selectedBrands.some(b => product.brand?.toLowerCase() === b.toLowerCase());
      const priceMatch = (product.price || 0) <= filters.priceRange;
      const stockMatch = !filters.inStockOnly || (product.stock && product.stock > 0);
      const searchMatch = filters.debouncedSearchQuery.trim() === '' ||
        product.name?.toLowerCase().includes(filters.debouncedSearchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.debouncedSearchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(filters.debouncedSearchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(filters.debouncedSearchQuery.toLowerCase());
      return catMatch && brandMatch && priceMatch && stockMatch && searchMatch;
    });
  }, [products, filters.selectedCategories, filters.selectedBrands, filters.inStockOnly, filters.priceRange, filters.debouncedSearchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [filteredProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-16 md:pt-20">
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">Tech Shop</h1>
            <p className="text-lg md:text-2xl max-w-3xl mx-auto">
              Quality tech products and accessories for all your technology needs.
            </p>
          </div>
        </section>

        <div className="bg-white/95 border-b border-border px-4 py-3 backdrop-blur sticky top-16 md:top-20 z-20">
          <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
            <button
              className="md:hidden flex items-center gap-2 text-sm font-medium text-primary min-h-[44px] px-2"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="mobile-filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {filters.activeFilterCount > 0 && (
                <span className="bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {filters.activeFilterCount}
                </span>
              )}
              <ChevronDown className={`h-3 w-3 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
            </button>
            <p className="text-sm text-muted-foreground hidden md:block">
              Showing <span className="font-medium text-primary">{sortedProducts.length}</span> products
            </p>

            <div className="relative flex-1 max-w-xs sm:max-w-sm mx-2 sm:mx-4">
              <label htmlFor="product-search" className="sr-only">Search for products</label>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 pointer-events-none" aria-hidden="true" />
              <input
                id="product-search"
                type="search"
                value={filters.searchQuery}
                onChange={e => filters.setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-md bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[44px]"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => filters.setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-muted-foreground hidden sm:block">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm border border-border rounded-md px-2 sm:px-3 py-2 bg-white text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary min-h-[44px]"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Horizontal filter chips - mobile optimized */}
          <div className="max-w-screen-xl mx-auto mt-3">
            <FilterChips filters={filters} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <div className="flex gap-6">
            <aside className="hidden md:block w-64 flex-shrink-0" aria-label="Product filters">
              <FilterSidebar filters={filters} maxPrice={maxPrice} categories={categories} brands={brands} />
            </aside>

            {mobileFiltersOpen && (
              <div
                className="fixed inset-0 z-50 bg-black/40 md:hidden animate-fade-in"
                onClick={() => setMobileFiltersOpen(false)}
                aria-hidden="true"
              >
                <div
                  id="mobile-filters"
                  className="absolute bottom-0 inset-x-0 max-h-[85vh] bg-white rounded-t-2xl overflow-y-auto animate-slide-up pb-safe"
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mobile filters"
                >
                  <div className="sticky top-0 bg-white pt-3 pb-2 px-4 border-b border-border">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-muted-foreground hover:text-foreground"
                        aria-label="Close filters"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <FilterSidebar filters={filters} maxPrice={maxPrice} categories={categories} brands={brands} />
                  </div>
                  <div className="sticky bottom-0 bg-white border-t border-border p-4 pb-safe">
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full bg-primary text-white py-3 rounded-md font-medium min-h-[48px]"
                    >
                      Show {sortedProducts.length} Products
                    </button>
                  </div>
                </div>
              </div>
            )}

            <main className="flex-1 min-w-0 overflow-hidden">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5" role="status" aria-live="polite">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-24" role="alert">
                  <p className="text-red-500 mb-4">{error}</p>
                  <button
                    onClick={retryFetch}
                    className="px-4 py-2 bg-primary text-white rounded-md text-sm hover:bg-primary/90 min-h-[44px]"
                  >
                    Retry
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground">No products match your filters.</p>
                  <button onClick={filters.clearAll} className="mt-3 text-primary text-sm hover:underline min-h-[44px] px-4">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                  {sortedProducts.map(product => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      imageErrors={imageErrors}
                      setImageErrors={setImageErrors}
                      addToCart={addToCart}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16 bg-gray-50 pb-24 md:pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <h3 className="font-bold text-2xl text-black mb-2" aria-hidden="true">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Quality Assured</h4>
              <p className="text-sm text-gray-600">All products tested and verified</p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2" aria-hidden="true">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Warranty Included</h4>
              <p className="text-sm text-gray-600">Every purchase comes with warranty</p>
            </div>
            <div>
              <h3 className="font-bold text-2xl text-black mb-2" aria-hidden="true">✓</h3>
              <h4 className="font-bold mb-2 text-[#0a1f3d]">Secure Checkout</h4>
              <p className="text-sm text-gray-600">Safe and convenient WhatsApp checkout</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </div>
  );
}

const Shop = () => <ShopContent />;

export default Shop;
