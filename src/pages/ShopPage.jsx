/**
 * TR-Tech — Shop Page (Product Catalog)
 *
 * Main product browsing page with filtering, sorting, and search capabilities.
 *
 * Features:
 * - Product grid with responsive columns (1-3 based on viewport)
 * - Full-featured filter system: categories, brands, price range, in-stock
 * - Search with debounced input (250ms) matching name, description, category, brand
 * - Sort options: featured, price asc/desc, rating
 * - Mobile filter drawer with focus trap and escape handling
 * - URL parameter support for initial category/brand filtering
 * - Image error handling with fallback placeholder
 * - Wishlist toggle integration on each product card
 * - Skeleton loading state during data fetch
 * - "admin-data-changed" event listener for real-time updates
 *
 * Architecture:
 * - useDebounce: custom hook for delayed search filtering
 * - useFilters: custom hook encapsulating all filter state and logic
 * - ProductCard: presentational component for individual products
 * - ProductCardSkeleton: loading placeholder
 * - FilterChips: horizontal quick-filter buttons
 * - FilterSidebar: full filter panel (desktop sidebar / mobile drawer)
 * - ShopContent: main component orchestrating data and layout
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { Smartphone, ShoppingCart, SlidersHorizontal, Search, X, Heart, ChevronDown } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { useWishlist } from '../components/WishlistContext';
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api';
import { getProductImageUrl } from '../lib/imageUrl';
import { formatPrice } from '../lib/format';
import { StarRating } from '../components/ProductDetail';
import { FALLBACK_CATEGORIES, FALLBACK_BRANDS, SORT_OPTIONS } from '../constants';
import { useScrollIndicators } from '../hooks/useScrollIndicators';

// Price slider step increment (in ZAR)
const PRICE_STEP = 100;

// Debounce hook: delays value updates to reduce re-renders during rapid input
function useDebounce(value, delay = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

const FILTER_PARAMS = ['category', 'brand', 'minPrice', 'maxPrice', 'inStock', 'sort', 'page', 'search'];

// Custom hook encapsulating all filter state, actions, and derived values
function useFilters(maxPrice = 30000) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState(maxPrice);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery);

  // Toggle category selection (add if not present, remove if present)
  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  // Toggle brand selection
  const toggleBrand = useCallback((brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }, []);

  // Reset all filters to defaults
  const clearAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceRange(maxPrice);
    setSearchQuery('');
  }, [maxPrice]);

  // Count of active filters for badge display
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

// Individual product card with refined e-commerce aesthetic
// - 1:1 image surface with subtle zoom on hover
// - Floating wishlist button + discount/flash badges
// - In-stock chip, brand/category meta, prominent CTA
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

  const inStock = product.stock && product.stock > 0;
  const lowStock = inStock && product.stock <= 5;
  const outOfStock = !inStock;

  return (
    <article className="group relative flex flex-col h-full bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-300 ease-out overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
      {/* Image surface */}
      <Link to={`/products/${id}`} className="block relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {/* Decorative gradient sheen on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/[0.03] via-transparent to-secondary/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" aria-hidden="true" />

        {/* Badge stack (top-left) */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1.5">
          {discount && (
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-500 text-white text-[11px] font-bold leading-none px-2 py-1 rounded-md shadow-sm">
              <span>-{discount}%</span>
              <span className="opacity-80">OFF</span>
            </span>
          )}
          {discount && discount >= 70 && (
            <span className="inline-flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider leading-none px-2 py-1 rounded-md shadow-sm">
              Flash
            </span>
          )}
          {outOfStock && (
            <span className="inline-flex items-center bg-slate-900/90 backdrop-blur text-white text-[10px] font-bold uppercase tracking-wider leading-none px-2 py-1 rounded-md">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist button (top-right) */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          disabled={toggling}
          className={`absolute top-2.5 right-2.5 z-20 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
            toggling
              ? 'opacity-60 cursor-wait bg-white/95'
              : inWishlist
              ? 'bg-white text-rose-500 hover:bg-rose-50 ring-1 ring-rose-200'
              : 'bg-white/95 text-slate-500 hover:text-rose-500 hover:bg-white ring-1 ring-slate-200/80'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={inWishlist}
        >
          {toggling ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Heart className={`h-[18px] w-[18px] transition-transform ${inWishlist ? 'fill-rose-500 scale-110' : 'group-hover:scale-110'}`} />
          )}
        </button>

        {/* Product image with subtle zoom */}
        {product.image && !imageErrors[id] ? (
          <img
            src={getProductImageUrl(product.image)}
            alt={`${product.name} product image`}
            className="w-full h-full object-contain p-4 transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Smartphone className="h-20 w-20 text-slate-300" aria-hidden="true" />
          </div>
        )}

        {/* Bottom stock chip on image */}
        {lowStock && (
          <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-amber-50/95 backdrop-blur text-amber-700 text-[10px] font-semibold leading-none px-2 py-1 rounded-md ring-1 ring-amber-200/80">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" aria-hidden="true" />
            Only {product.stock} left
          </div>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {/* Brand & category meta */}
        {(product.brand || product.category) && (
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-500">
            {product.brand && <span className="text-primary/80">{product.brand}</span>}
            {product.brand && product.category && <span className="text-slate-300">·</span>}
            {product.category && <span>{product.category}</span>}
          </div>
        )}

        {/* Title */}
        <Link to={`/products/${id}`} className="block">
          <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1.5" aria-label={`${product.rating || 0} out of 5 stars`}>
          <StarRating rating={product.rating} reviews={product.reviews} size={3} />
          {(product.reviews || 0) > 0 && (
            <span className="text-xs text-slate-500">({product.reviews})</span>
          )}
        </div>

        {/* Price block */}
        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-slate-900 tracking-tight">
              {formatPrice(product.price || 0)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-slate-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          {discount && (
            <p className="text-xs font-medium text-emerald-600 mt-0.5">
              You save {formatPrice((product.originalPrice || 0) - (product.price || 0))}
            </p>
          )}
        </div>
      </div>

      {/* CTA — full bleed at card bottom */}
      <div className="px-4 pb-4 pt-1">
        <button
          type="button"
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            outOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30 active:scale-[0.98]'
          }`}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" />
          <span>{outOfStock ? 'Out of Stock' : 'Add to Cart'}</span>
        </button>
      </div>
    </article>
  );
}

// Skeleton placeholder with shimmer animation
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden">
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      <div className="p-4 space-y-2.5 flex-1">
        <div className="h-3 bg-slate-200/70 rounded w-1/3" />
        <div className="h-4 bg-slate-200/70 rounded w-full" />
        <div className="h-4 bg-slate-200/70 rounded w-3/4" />
        <div className="h-3 bg-slate-200/70 rounded w-1/2 mt-1" />
        <div className="h-6 bg-slate-200/70 rounded w-1/3 mt-3" />
      </div>
      <div className="px-4 pb-4 pt-1">
        <div className="h-[44px] bg-slate-200/70 rounded-xl w-full" />
      </div>
    </div>
  );
}

// Horizontal scrollable quick-filter chips with elevated active state
function FilterChips({ filters, sortBy, setSortBy }) {
  const quickFilters = [
    {
      label: 'In Stock',
      active: filters.inStockOnly,
      toggle: () => filters.setInStockOnly(!filters.inStockOnly),
      icon: (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
      ),
    },
    {
      label: 'Under R1000',
      active: filters.priceRange <= 1000,
      toggle: () => filters.setPriceRange(filters.priceRange <= 1000 ? filters.maxPrice : 1000),
    },
    {
      label: 'Top Rated',
      active: sortBy === 'rating',
      toggle: () => setSortBy(sortBy === 'rating' ? 'featured' : 'rating'),
    },
  ];

  const { ref, className } = useScrollIndicators();

  return (
    <div
      ref={ref}
      className={`flex gap-2 overflow-x-auto scrollbar-hide ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {quickFilters.map((filter) => (
        <button
          key={filter.label}
          onClick={filter.toggle}
          className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[32px] active:scale-[0.96] ${
            filter.active
              ? 'bg-gradient-to-r from-primary to-primary/90 text-white shadow-sm shadow-primary/25 hover:shadow-md'
              : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary'
          }`}
        >
          {filter.icon}
          <span>{filter.label}</span>
        </button>
      ))}
      {filters.activeFilterCount > 0 && (
        <button
          onClick={filters.clearAll}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 hover:border-rose-200 active:scale-[0.96] transition-all duration-200 min-h-[32px]"
        >
          <X className="h-3 w-3" />
          Clear All
        </button>
      )}
    </div>
  );
}

// Full filter sidebar with refined sections and active-pill stack
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
    if (e.key === 'Enter') e.target.blur();
  };

  const totalActiveFilters = selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (priceRange < maxPrice ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
              {totalActiveFilters > 0 && (
                <p className="text-xs text-slate-500">{totalActiveFilters} active</p>
              )}
            </div>
          </div>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Pills */}
      {isFiltered && (
        <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/50">
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map(cat => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary ring-1 ring-primary/20"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary/10 text-secondary ring-1 ring-secondary/20"
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
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200">
                In Stock
                <button
                  onClick={() => setInStockOnly(false)}
                  className="ml-0.5 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remove in stock filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-200/80">
        {/* Categories Section */}
        <div className="px-5 py-4">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between group"
            aria-expanded={expandedSections.categories}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Categories</span>
              {selectedCategories.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedCategories.length}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${expandedSections.categories ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.categories ? 'max-h-72 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-0.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
              {categories.length === 0 ? (
                <p className="text-sm text-slate-400 py-3 px-2 text-center">No categories available</p>
              ) : (
                categories.map(cat => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className={`flex items-center gap-3 cursor-pointer py-2 px-2.5 rounded-lg transition-all ${
                        isSelected ? 'bg-primary/[0.06]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleCategory(cat)}
                          className="sr-only peer"
                        />
                        <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-primary border-primary scale-100'
                            : 'border-slate-300 group-hover:border-primary/50 scale-100'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm transition-colors flex-1 ${
                        isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {cat}
                      </span>
                    </label>
                  );
                })
              )}
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
              <span className="text-sm font-semibold text-slate-900">Brands</span>
              {selectedBrands.length > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                  {selectedBrands.length}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${expandedSections.brands ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.brands ? 'max-h-72 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-0.5 max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent pr-1">
              {brands.length === 0 ? (
                <p className="text-sm text-slate-400 py-3 px-2 text-center">No brands available</p>
              ) : (
                brands.map(brand => {
                  const isSelected = selectedBrands.includes(brand);
                  return (
                    <label
                      key={brand}
                      className={`flex items-center gap-3 cursor-pointer py-2 px-2.5 rounded-lg transition-all ${
                        isSelected ? 'bg-secondary/[0.06]' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="relative flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleBrand(brand)}
                          className="sr-only peer"
                        />
                        <div className={`w-[18px] h-[18px] rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? 'bg-secondary border-secondary'
                            : 'border-slate-300 group-hover:border-secondary/50'
                        }`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm transition-colors flex-1 ${
                        isSelected ? 'text-slate-900 font-semibold' : 'text-slate-600 group-hover:text-slate-900'
                      }`}>
                        {brand}
                      </span>
                    </label>
                  );
                })
              )}
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
              <span className="text-sm font-semibold text-slate-900">Price Range</span>
              {priceRange < maxPrice && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold ring-1 ring-primary/20">
                  Active
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${expandedSections.price ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.price ? 'max-h-48 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
            <div className="px-4">
              {/* Price Range Display */}
              <div className="flex items-center justify-between mb-5 gap-3">
                <div className="flex-1 text-center">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Min</span>
                  <div className="mt-1 px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700">
                    R0
                  </div>
                </div>
                <div className="h-px w-6 bg-slate-300 mt-5" />
                <div className="flex-1 text-center">
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Max</span>
                  <div
                    className="mt-1 px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold text-primary cursor-pointer hover:bg-primary/10 hover:ring-2 hover:ring-primary/30 transition-all"
                    onClick={() => setIsEditingPrice(true)}
                  >
                    {isEditingPrice ? (
                      <input
                        type="text"
                        value={priceInputValue}
                        onChange={handlePriceInputChange}
                        onBlur={handlePriceInputBlur}
                        onKeyDown={handlePriceInputKeyDown}
                        className="w-full bg-transparent text-center outline-none text-primary font-bold"
                        autoFocus
                      />
                    ) : (
                      <span>R{priceRange.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Custom Range Slider */}
              <div className="relative h-6 flex items-center">
                <div className="absolute inset-x-0 h-1.5 bg-slate-200 rounded-full" />
                <div
                  className="absolute h-1.5 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
                  style={{ width: `${(priceRange / maxPrice) * 100}%` }}
                />
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={PRICE_STEP}
                  value={priceRange}
                  onChange={e => setPriceRange(Number(e.target.value))}
                  className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer z-10"
                  aria-label="Maximum price"
                  aria-valuemin={0}
                  aria-valuemax={maxPrice}
                  aria-valuenow={priceRange}
                />
                <div
                  className="absolute w-5 h-5 bg-white border-[3px] border-primary rounded-full shadow-md -translate-x-1/2 pointer-events-none transition-transform hover:scale-125"
                  style={{ left: `${(priceRange / maxPrice) * 100}%` }}
                />
              </div>

              <div className="flex justify-between mt-2.5 px-0.5">
                <span className="text-xs text-slate-500 font-medium">R0</span>
                <span className="text-xs text-slate-500 font-medium">R{Math.round(maxPrice / 2).toLocaleString()}</span>
                <span className="text-xs text-slate-500 font-medium">R{maxPrice.toLocaleString()}</span>
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
                <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                  inStockOnly ? 'bg-primary' : 'bg-slate-200'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    inStockOnly ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900">In Stock Only</span>
                <p className="text-xs text-slate-500">Hide out of stock items</p>
              </div>
            </div>
            {inStockOnly && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                On
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-5 py-4 border-t border-slate-200/80 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {isFiltered ? (
              <span><span className="font-semibold text-slate-900">{totalActiveFilters}</span> filters applied</span>
            ) : (
              'No filters active'
            )}
          </p>
          {isFiltered && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
            >
              Reset all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


// Main shop component orchestrating data fetching, filtering, sorting, and layout
function ShopContent() {
  const { addToCart } = useCart();
  const [searchParams] = useSearchParams();

  // Data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState(() => {
    const param = searchParams.get('sort');
    return SORT_OPTIONS.some((o) => o.value === param) ? param : 'featured';
  });

  // Read initial filter values from URL params (e.g., ?category=Laptops&brand=Apple)
  const initialCategory = searchParams.get('category');
  const initialBrand = searchParams.get('brand');

  const filters = useFilters(30000);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 20;

  // Calculate max price from actual product data (fallback to 30000)
  const maxPrice = useMemo(() => {
    const max = products.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0);
    return max > 0 ? max : 30000;
  }, [products]);

  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Fetch categories and brands in parallel from API
  const fetchCategoriesAndBrands = useCallback(async () => {
    const [catRes, brandRes] = await Promise.allSettled([
      categoriesAPI.getActive(),
      brandsAPI.getActive(),
    ]);

    if (catRes.status === 'fulfilled' && catRes.value.success) {
      const catNames = (catRes.value.data || []).map((c) => c.name || c);
      setCategories(catNames.length ? [...new Set(catNames)] : []);
    } else {
      setCategories([]);
    }

    if (brandRes.status === 'fulfilled' && brandRes.value.success) {
      const brandNames = (brandRes.value.data || []).map((b) => b.name || b);
      setBrands(brandNames.length ? [...new Set(brandNames)] : []);
    } else {
      setBrands([]);
    }
  }, []);

  // Fetch all products from API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productsAPI.getAll({ page: currentPage, limit: productsPerPage });

      if (data.success) {
        setProducts(data.data || []);
        setTotalProducts(data.total || 0);
        setImageErrors({});
      } else {
        setError('Unable to load products. Please check your connection and try again.');
      }
    } catch {
      setError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, productsPerPage]);

  // Initial data load
  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [fetchProducts, fetchCategoriesAndBrands]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters.selectedCategories, filters.selectedBrands, filters.inStockOnly, filters.priceRange, filters.debouncedSearchQuery, sortBy]);

  // Apply initial category filter from URL when categories are loaded
  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const match = categories.find(c => c.toLowerCase() === initialCategory.toLowerCase());
      if (match && !filters.selectedCategories.includes(match)) {
        filters.toggleCategory(match);
      }
    }
  }, [initialCategory, categories, filters]);

  // Apply initial brand filter from URL when brands are loaded
  useEffect(() => {
    if (initialBrand && brands.length > 0) {
      const match = brands.find(b => b.toLowerCase() === initialBrand.toLowerCase());
      if (match && !filters.selectedBrands.includes(match)) {
        filters.toggleBrand(match);
      }
    }
  }, [initialBrand, brands, filters]);

  // Refresh products when window regains focus (handles back navigation)
  useEffect(() => {
    const handleFocus = () => {
      fetchProducts();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchProducts]);

  // Focus trap, escape handler, and body-scroll-lock for mobile filter drawer
  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const dialog = document.getElementById('mobile-filters');
    if (!dialog) return;

    // Lock body scroll — preserves scroll position and prevents iOS bounce
    const scrollY = window.scrollY;
    const body = document.body;
    const originalStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialog.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileFiltersOpen(false);
        return;
      }

      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstFocusable?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      body.style.position = originalStyles.position;
      body.style.top = originalStyles.top;
      body.style.width = originalStyles.width;
      body.style.overflow = originalStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [mobileFiltersOpen]);

  // Listen for admin data changes to refresh products/categories/brands
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

  // Reset price range to max when products are first loaded.
  // Subsequent refreshes (focus, admin-data-changed) must not override the
  // user's current price filter, otherwise narrowed ranges are silently wiped.
  const priceRangeInitializedRef = useRef(false);
  useEffect(() => {
    if (!loading && products.length > 0 && !priceRangeInitializedRef.current) {
      filters.setPriceRange(maxPrice);
      priceRangeInitializedRef.current = true;
    }
  }, [loading, products.length, maxPrice, filters]);

  const retryFetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products based on all active filter criteria
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

  // Sort filtered products by selected option
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') {
        const aTime = new Date(a.createdAt || 0).getTime();
        const bTime = new Date(b.createdAt || 0).getTime();
        return bTime - aTime;
      }
      return 0;
    });
  }, [filteredProducts, sortBy]);

  return (
    <>
      <Navbar />
      <Seo
        title="Shop"
        description="Browse TR-Tech's full range of tech products — smartphones, laptops, gaming gear, printers, storage, and accessories. Filter by brand, price, and category."
        noindex={FILTER_PARAMS.some((p) => searchParams.has(p))}
      />
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20">
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-6xl font-bold mb-4 md:mb-6">Tech Shop</h1>
            <p className="text-lg md:text-2xl max-w-3xl mx-auto">
              Quality tech products and accessories for all your technology needs.
            </p>
          </div>
        </section>

        {/* Sticky Toolbar */}
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-16 md:top-20 z-20 shadow-sm shadow-slate-900/[0.02]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Row 1 — Search (mobile-first, full-width) */}
            <div className="flex items-center gap-2 pt-3.5 pb-2.5">
              <div className="relative flex-1 min-w-0">
                <label htmlFor="product-search" className="sr-only">Search for products</label>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" aria-hidden="true" />
                <input
                  id="product-search"
                  type="search"
                  value={filters.searchQuery}
                  onChange={e => filters.setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-100/70 border border-transparent rounded-full text-slate-900 placeholder:text-slate-400 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary focus:bg-white transition-all min-h-[44px]"
                />
                {filters.searchQuery && (
                  <button
                    type="button"
                    onClick={() => filters.setSearchQuery('')}
                    aria-label="Clear search"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 inline-flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 2 — Filters, Count, Sort */}
            <div className="flex items-center gap-2 pb-3">
               {/* Tablet + mobile filter trigger (hidden at lg where sidebar is visible) */}
               <button
                 className="lg:hidden inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 min-h-[36px] px-3 rounded-full border border-slate-200 bg-white hover:border-primary/40 hover:text-primary active:scale-[0.97] transition-all"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                aria-expanded={mobileFiltersOpen}
                aria-controls="mobile-filters"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters</span>
                {filters.activeFilterCount > 0 && (
                  <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
                    {filters.activeFilterCount}
                  </span>
                )}
              </button>

              {/* Result count */}
              <p className="text-xs text-slate-500 flex items-center gap-1 ml-1">
                <span className="font-semibold text-slate-700 tabular-nums">{sortedProducts.length}</span>
                <span className="text-slate-400">/</span>
                <span className="tabular-nums">{products.length}</span>
                <span className="hidden sm:inline">products</span>
                {filters.activeFilterCount > 0 && (
                  <span className="hidden sm:inline-flex ml-1 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
                    {filters.activeFilterCount} filter{filters.activeFilterCount > 1 ? 's' : ''}
                  </span>
                )}
              </p>

              <div className="ml-auto" />

              {/* Sort */}
              <div className="relative flex-shrink-0">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none text-xs sm:text-sm border border-slate-200 rounded-full pl-3 sm:pl-4 pr-8 py-2 sm:py-2.5 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-h-[36px] sm:min-h-[40px] cursor-pointer hover:border-slate-300 active:scale-[0.98] transition-all"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" aria-hidden="true" />
              </div>
            </div>

            {/* Row 3 — Horizontal filter chips */}
            <div className="pb-3 -mx-4 sm:-mx-6 lg:-mx-8">
              <div className="px-4 sm:px-6 lg:px-8">
                <FilterChips filters={filters} sortBy={sortBy} setSortBy={setSortBy} />
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex gap-6 lg:gap-8">
            <aside className="hidden lg:block w-64 lg:w-72 flex-shrink-0" aria-label="Product filters">
              <div className="sticky top-[140px] lg:top-[156px]">
                <FilterSidebar filters={filters} maxPrice={maxPrice} categories={categories} brands={brands} />
              </div>
            </aside>

            {mobileFiltersOpen && (
              <div
                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm md:hidden animate-fade-in"
                onClick={() => setMobileFiltersOpen(false)}
                aria-hidden="true"
              >
                <div
                  id="mobile-filters"
                  className="absolute bottom-0 inset-x-0 max-h-[88dvh] bg-white rounded-t-3xl overflow-y-auto animate-slide-up pb-safe shadow-2xl"
                  onClick={e => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-label="Mobile filters"
                >
                  <div className="sticky top-0 bg-white/95 backdrop-blur-md pt-3 pb-3 px-5 border-b border-slate-200 z-10">
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900">Filters</h3>
                      <button
                        onClick={() => setMobileFiltersOpen(false)}
                        className="min-w-[40px] min-h-[40px] flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        aria-label="Close filters"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <FilterSidebar filters={filters} maxPrice={maxPrice} categories={categories} brands={brands} />
                  </div>
                  <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 pb-safe z-10">
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold min-h-[48px] shadow-sm shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all"
                    >
                      Show {sortedProducts.length} {sortedProducts.length === 1 ? 'Product' : 'Products'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <main className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6" role="status" aria-live="polite">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 md:py-28 text-center" role="alert">
                  <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
                    <X className="h-8 w-8 text-rose-500" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">Something went wrong</h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6">{error}</p>
                  <button
                    onClick={retryFetch}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 min-h-[44px]"
                  >
                    Try again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 md:py-28 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-5">
                    <Smartphone className="h-10 w-10 text-slate-400" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No products found</h3>
                  <p className="text-sm text-slate-500 max-w-sm mb-6">
                    Try adjusting your filters or search terms to see more results.
                  </p>
                  <button
                    onClick={filters.clearAll}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20 min-h-[44px]"
                  >
                    <X className="h-4 w-4" />
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
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

            {/* Pagination Controls */}
            {!loading && !error && sortedProducts.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200/80">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-all"
                >
                  Previous
                </button>
                <span className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="py-12 md:py-16 bg-white border-t border-slate-200/80">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg" aria-hidden="true">✓</span>
              </div>
              <h2 className="font-semibold mb-1.5 text-slate-900">Quality Assured</h2>
              <p className="text-sm text-slate-500">All products tested and verified</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg" aria-hidden="true">✓</span>
              </div>
              <h2 className="font-semibold mb-1.5 text-slate-900">Warranty Included</h2>
              <p className="text-sm text-slate-500">Every purchase comes with warranty</p>
            </div>
            <div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-lg" aria-hidden="true">✓</span>
              </div>
              <h2 className="font-semibold mb-1.5 text-slate-900">Secure Checkout</h2>
              <p className="text-sm text-slate-500">Safe and convenient WhatsApp checkout</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BottomNav />
    </>
  );
}

const Shop = () => <ShopContent />;

export default Shop;
