/**
 * TR-Tech — Shop Page (Product Catalog)
 *
 * Main product browsing page with filtering, sorting, and search capabilities.
 *
 * Features:
 * - Breadcrumb navigation
 * - Search bar with debounced input (250ms)
 * - Category tabs with icons and horizontal scrolling on mobile
 * - Product count display (showing X of Y products)
 * - Sort dropdown with multiple options
 * - Desktop filter sidebar with collapsible sections
 * - Mobile filter drawer with focus trap
 * - Responsive product grid (1-4 columns)
 * - Product cards with wishlist, badges, ratings, stock status
 * - Skeleton loading states
 * - URL parameter support for initial category/brand filtering
 * - Real-time updates via admin-data-changed event
 * - Pagination support
 *
 * Architecture:
 * - useDebounce: custom hook for delayed search filtering
 * - useFilters: custom hook encapsulating all filter state and logic
 * - ShopSearchBar: search input with clear button
 * - ShopCategoryTabs: horizontal category pills
 * - ShopSortDropdown: sorting select
 * - FilterSidebar: full filter panel (desktop)
 * - MobileFilterDrawer: slide-out filter panel (mobile)
 * - ProductCard: presentational component for individual products
 * - ProductCardSkeleton: loading placeholder
 * - ShopContent: main component orchestrating data and layout
 *
 * Bug fixes applied:
 * 1. Fixed broken isFetching guard — was using static property on useCallback
 *    result which gets a new reference every render. Now uses useRef.
 * 2. Eliminated duplicate search query state (was in both ShopContent and
 *    useFilters). Now single source of truth in useFilters.
 * 3. Fixed clearAll using stale maxPrice — useFilters now has dynamic maxPrice
 *    state that updates when products load.
 * 4. Fixed sort changes bypassing URL sync — FilterSidebar and
 *    MobileFilterDrawer now receive handleSortChange (with URL sync) instead
 *    of raw setSortBy.
 * 5. Eliminated duplicate categories fetch — ShopCategoryTabs now receives
 *    categories as prop from parent instead of fetching independently.
 * 6. Fixed dependency arrays to prevent unnecessary re-renders caused by
 *    passing the entire filters object instead of individual primitives.
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, brandsAPI } from '../services/api';
import { SORT_OPTIONS, FALLBACK_CATEGORIES, FALLBACK_BRANDS } from '../constants';
import {
  ShopSearchBar,
  ShopCategoryTabs,
  ShopSortDropdown,
  ProductCard,
  ProductCardSkeleton,
  FilterSidebar,
  MobileFilterDrawer,
} from '../components/shop';
import { SlidersHorizontal, Loader2, AlertCircle, Package, Search } from 'lucide-react';

const PRODUCTS_PER_PAGE = 20;
const DEBOUNCE_DELAY = 250;

/**
 * Debounce hook: delays value updates to reduce re-renders during rapid input.
 * @param {any} value - The value to debounce
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {any} The debounced value
 */
function useDebounce(value, delay = DEBOUNCE_DELAY) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Custom hook encapsulating all filter state, actions, and derived values.
 * Uses a single source of truth for all filter fields.
 * The maxPrice is stored as state so it can be updated dynamically from product data,
 * and clearAll() always resets to the current maxPrice.
 *
 * @param {number} initialMaxPrice - Initial maximum price ceiling (default 30000)
 * @returns {object} Filter state and action methods
 */
function useFilters(initialMaxPrice = 30000) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPriceState, setMaxPrice] = useState(initialMaxPrice);
  const [priceRange, setPriceRange] = useState(initialMaxPrice);
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, DEBOUNCE_DELAY);

  /** Toggle a category in/out of the selectedCategories array */
  const toggleCategory = useCallback((cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  }, []);

  /** Toggle a brand in/out of the selectedBrands array */
  const toggleBrand = useCallback((brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  }, []);

  /** Reset all filters to their default values */
  const clearAll = useCallback(() => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setInStockOnly(false);
    setPriceRange(maxPriceState);
    setSearchQuery('');
    setMinRating(0);
    setOnSaleOnly(false);
    setNewArrivalsOnly(false);
  }, [maxPriceState]);

  /** Count of active filters for UI badge display */
  const activeFilterCount = useMemo(() => (
    selectedCategories.length +
    selectedBrands.length +
    (inStockOnly ? 1 : 0) +
    (priceRange < maxPriceState ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (newArrivalsOnly ? 1 : 0)
  ), [selectedCategories, selectedBrands, inStockOnly, priceRange, maxPriceState, minRating, onSaleOnly, newArrivalsOnly]);

  // Memoize the entire return object to prevent unnecessary re-renders
  // of consumers that destructure individual fields
  return useMemo(() => ({
    selectedCategories, setSelectedCategories, toggleCategory,
    selectedBrands, toggleBrand,
    inStockOnly, setInStockOnly,
    maxPrice: maxPriceState,
    setMaxPrice,
    priceRange, setPriceRange,
    searchQuery, setSearchQuery,
    debouncedSearchQuery,
    minRating, setMinRating,
    onSaleOnly, setOnSaleOnly,
    newArrivalsOnly, setNewArrivalsOnly,
    clearAll, activeFilterCount,
    isFiltered: activeFilterCount > 0,
  }), [
    selectedCategories, setSelectedCategories, toggleCategory,
    selectedBrands, toggleBrand,
    inStockOnly, setInStockOnly,
    maxPriceState, setMaxPrice,
    priceRange, setPriceRange,
    searchQuery, setSearchQuery, debouncedSearchQuery,
    minRating, setMinRating,
    onSaleOnly, setOnSaleOnly,
    newArrivalsOnly, setNewArrivalsOnly,
    clearAll, activeFilterCount,
  ]);
}

/**
 * Main shop component orchestrating data fetching, filtering, sorting, and layout.
 * Manages server-side fetching with client-side filtering as fallback.
 */
function ShopContent() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Data state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Read initial filter values from URL params
  const initialCategory = searchParams.get('category');
  const initialBrand = searchParams.get('brand');
  const initialSearch = searchParams.get('search');

  // Initialize sort from URL or default
  const [sortBy, setSortBy] = useState(() => {
    const param = searchParams.get('sort');
    return SORT_OPTIONS.some((o) => o.value === param) ? param : 'featured';
  });

  // Initialize filters with hooks
  const filters = useFilters(30000);

  // Refs for fetch guards
  const isFetchingMetaRef = useRef(false);
  const initialLoadRef = useRef(false);
  const focusDebounceRef = useRef(null);
  const priceRangeInitializedRef = useRef(false);

  // Calculate max price from actual product data (fallback to 30000)
  const maxPrice = useMemo(() => {
    const max = products.reduce((max, p) => Math.max(max, Number(p.price) || 0), 0);
    return max > 0 ? max : 30000;
  }, [products]);

  // Update the filters' maxPrice when products are loaded
  useEffect(() => {
    if (!loading && products.length > 0 && !priceRangeInitializedRef.current) {
      filters.setMaxPrice(maxPrice);
      filters.setPriceRange(maxPrice);
      priceRangeInitializedRef.current = true;
    }
  }, [loading, products, maxPrice, filters]);

  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Build query params from current filters for server-side fetching
  const buildQueryParams = useCallback(() => {
     const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: PRODUCTS_PER_PAGE.toString(),
      sort: sortBy,
    });

    // Send ALL selected categories as comma-separated values for server-side $in filtering
    if (filters.selectedCategories.length > 0) {
      queryParams.set('category', filters.selectedCategories.join(','));
    }
    if (filters.selectedBrands.length > 0) {
      queryParams.set('brand', filters.selectedBrands.join(','));
    }
    if (filters.inStockOnly) {
      queryParams.set('inStock', 'true');
    }
    if (filters.priceRange < filters.maxPrice) {
      queryParams.set('maxPrice', filters.priceRange.toString());
    }
    if (filters.debouncedSearchQuery.trim()) {
      queryParams.set('search', filters.debouncedSearchQuery.trim());
    }
    if (filters.minRating > 0) {
      queryParams.set('minRating', filters.minRating.toString());
    }
    if (filters.onSaleOnly) {
      queryParams.set('onSale', 'true');
    }
    if (filters.newArrivalsOnly) {
      queryParams.set('newArrivals', 'true');
    }

    return queryParams;
  }, [currentPage, sortBy, filters]);

  /** Fetch products from API with server-side filtering */
  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = buildQueryParams();
      const data = await productsAPI.getAll(Object.fromEntries(queryParams), signal);

      if (signal?.aborted) return;

      if (data.success) {
        setProducts(data.data || []);
        setTotalProducts(data.total || 0);
        setImageErrors({});
      } else {
        setError('Unable to load products. Please check your connection and try again.');
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Unable to load products. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, [buildQueryParams]);

  /** Fetch categories and brands in parallel from API with fallback */
  const fetchCategoriesAndBrands = useCallback(async () => {
    if (isFetchingMetaRef.current) return;
    isFetchingMetaRef.current = true;

    try {
      const [catRes, brandRes] = await Promise.allSettled([
        categoriesAPI.getActive(),
        brandsAPI.getActive(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.success) {
        const catNames = (catRes.value.data || []).map((c) => c.name || c);
        setCategories(catNames.length ? [...new Set(catNames)] : []);
      } else {
        setCategories(FALLBACK_CATEGORIES.map(c => c.name));
      }

      if (brandRes.status === 'fulfilled' && brandRes.value?.success) {
        const brandNames = (brandRes.value.data || []).map((b) => b.name || b);
        setBrands(brandNames.length ? [...new Set(brandNames)] : []);
      } else {
        setBrands(FALLBACK_BRANDS);
      }
    } finally {
      isFetchingMetaRef.current = false;
    }
  }, []);

  // Initial data load — only run once on mount
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;
    fetchProducts();
    fetchCategoriesAndBrands();
  }, []);

  // Refetch products whenever fetchProducts changes (i.e., when filters/sort/page change).
  // Uses AbortController to cancel stale requests so the latest filter state always wins.
  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  // Handle sort changes (syncs to URL)
  const handleSortChange = useCallback((newSort) => {
    setSortBy(newSort);
    const newParams = new URLSearchParams(searchParams);
    if (newSort === 'featured') {
      newParams.delete('sort');
    } else {
      newParams.set('sort', newSort);
    }
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  // Handle category changes from tabs — supports multi-select
  const handleCategoryChange = useCallback((value) => {
    let newCategories;
    if (!value) {
      newCategories = [];
    } else if (Array.isArray(value)) {
      newCategories = value;
    } else {
      newCategories = [value];
    }

    filters.setSelectedCategories(newCategories);

    const newParams = new URLSearchParams(searchParams);
    if (newCategories.length > 0) {
      newParams.set('category', newCategories.join(','));
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, filters]);

  // Handle search changes — sync searchQuery to state and URL immediately
  const handleSearchChange = useCallback((value) => {
    filters.setSearchQuery(value);
    const newParams = new URLSearchParams(searchParams);
    if (value.trim()) {
      newParams.set('search', value.trim());
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, filters]);

  const handleSearchClear = useCallback(() => {
    filters.setSearchQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('page');
    setSearchParams(newParams);
  }, [searchParams, setSearchParams, filters]);

  // Reset to first page when filters change (excluding priceRange, which is
  // dynamically set from product data on load and would cause unwanted resets)
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filters.selectedCategories,
    filters.selectedBrands,
    filters.inStockOnly,
    filters.debouncedSearchQuery,
    filters.minRating,
    filters.onSaleOnly,
    filters.newArrivalsOnly,
    sortBy,
  ]);

  // Apply initial category filter from URL when categories are loaded
  useEffect(() => {
    if (initialCategory && categories.length > 0) {
      const cats = initialCategory.split(',').map(c => c.trim()).filter(Boolean);
      cats.forEach(cat => {
        const match = categories.find(c => c.toLowerCase() === cat.toLowerCase());
        if (match && !filters.selectedCategories.includes(match)) {
          filters.toggleCategory(match);
        }
      });
    }
  }, [initialCategory, categories, filters.selectedCategories, filters.toggleCategory]);

  // Apply initial brand filter from URL when brands are loaded
  useEffect(() => {
    if (initialBrand && brands.length > 0) {
      const match = brands.find(b => b.toLowerCase() === initialBrand.toLowerCase());
      if (match && !filters.selectedBrands.includes(match)) {
        filters.toggleBrand(match);
      }
    }
  }, [initialBrand, brands, filters.selectedBrands, filters.toggleBrand]);

  // Apply initial search from URL on mount only
  const initialSearchAppliedRef = useRef(false);
  useEffect(() => {
    if (!initialSearchAppliedRef.current && initialSearch) {
      initialSearchAppliedRef.current = true;
      filters.setSearchQuery(initialSearch);
    }
  }, [initialSearch, filters]);

  // Refresh products when window regains focus (handles tab switching) — debounced
  useEffect(() => {
    const handleFocus = () => {
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
      focusDebounceRef.current = setTimeout(() => {
        fetchProducts();
      }, 1000);
    };
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      if (focusDebounceRef.current) {
        clearTimeout(focusDebounceRef.current);
      }
    };
  }, [fetchProducts]);

  // Listen for admin data changes to refresh products/categories/brands
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.type === 'categories' || e.detail?.type === 'brands') {
        fetchCategoriesAndBrands();
        fetchProducts();
      } else {
        fetchProducts();
      }
    };
    window.addEventListener('admin-data-changed', handler);
    return () => window.removeEventListener('admin-data-changed', handler);
  }, [fetchProducts, fetchCategoriesAndBrands]);

  const retryFetch = useCallback(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const catMatch = filters.selectedCategories.length === 0 ||
        filters.selectedCategories.some(c => product.category?.toLowerCase() === c.toLowerCase());
      const brandMatch = filters.selectedBrands.length === 0 ||
        filters.selectedBrands.some(b => product.brand?.toLowerCase() === b.toLowerCase());
      const priceMatch = (product.price || 0) <= filters.priceRange;
      const stockMatch = !filters.inStockOnly || (product.stock && product.stock > 0);
      const searchMatch = filters.searchQuery.trim() === '' ||
        product.name?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      const ratingMatch = filters.minRating === 0 ||
        ((product.rating || 0) >= filters.minRating && (product.reviews || 0) >= 3);
      const saleMatch = !filters.onSaleOnly ||
        (product.originalPrice && product.originalPrice > product.price);
      const newArrivalMatch = !filters.newArrivalsOnly || product.isNew;
      return catMatch && brandMatch && priceMatch && stockMatch && searchMatch && ratingMatch && saleMatch && newArrivalMatch;
    });
  }, [products, filters]);

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
        title="Shop Electronics & Accessories"
        description="Browse TR-Tech's full range of tech products — smartphones, laptops, gaming gear, printers, storage, and accessories. Filter by brand, price, and category."
        noindex={[
          'category', 'brand', 'search', 'sort', 'page',
          'minPrice', 'maxPrice', 'inStock', 'minRating', 'onSale', 'newArrivals'
        ].some((p) => searchParams.has(p))}
      />
      <div className="min-h-screen bg-slate-50 pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-blue-700 text-white py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Tech Shop</h1>
            <p className="text-lg md:text-2xl max-w-3xl mx-auto">
              Quality tech products and accessories for all your technology needs.
            </p>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-primary/40 transition-all"
              >
                <SlidersHorizontal className="h-5 w-5" />
                <span>Filters</span>
                {filters.isFiltered && (
                  <span className="bg-primary text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {filters.activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="lg:w-72 flex-shrink-0 hidden lg:block">
              <FilterSidebar
                filters={filters}
                maxPrice={maxPrice}
                categories={categories}
                brands={brands}
                onSortChange={handleSortChange}
              />
            </aside>

            {/* Mobile Filter Drawer */}
            <MobileFilterDrawer
              isOpen={mobileFiltersOpen}
              onClose={() => setMobileFiltersOpen(false)}
              filters={filters}
              maxPrice={maxPrice}
              categories={categories}
              brands={brands}
              onSortChange={handleSortChange}
            />

            {/* Main Product Area */}
            <main className="flex-1 min-w-0">
              {/* Search Bar */}
              <div className="mb-6">
                <ShopSearchBar
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  onClear={handleSearchClear}
                  placeholder="Search products, brands, categories..."
                />
              </div>

               {/* Category Tabs */}
               <div className="mb-6">
                 <ShopCategoryTabs
                   selectedCategories={filters.selectedCategories}
                   onCategoryChange={handleCategoryChange}
                   categories={categories}
                 />
               </div>

               {/* Shop Heading, Product Count, and Sort */}
               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-900">Shop Electronics & Accessories</h2>
                   <p className="text-sm text-slate-500 mt-1">
                     {loading ? 'Loading...' : totalProducts > 0
                       ? `Showing ${sortedProducts.length} of ${totalProducts} product${totalProducts !== 1 ? 's' : ''}`
                       : 'No products found'}
                   </p>
                 </div>
                 <div className="flex items-center gap-3">
                   {filters.isFiltered && (
                     <button
                       onClick={filters.clearAll}
                       className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
                     >
                       <Search className="h-4 w-4" />
                       Clear All Filters
                     </button>
                   )}
                   <ShopSortDropdown value={sortBy} onChange={handleSortChange} />
                 </div>
               </div>

              {/* Product Grid / Loading / Error / Empty */}
              {loading ? (
                <div className="space-y-6" role="status" aria-label="Loading products">
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" aria-hidden="true" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => (
                      <ProductCardSkeleton key={i} />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-16 px-4">
                  <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Unable to load products</h3>
                  <p className="text-slate-500 mb-6">{error}</p>
                  <button
                    onClick={retryFetch}
                    className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
                  >
                    <Loader2 className="h-4 w-4" />
                    Try Again
                  </button>
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No products found</h3>
                  <p className="text-slate-500 mb-6">
                    {filters.isFiltered
                      ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
                      : 'We couldn\'t find any products matching your criteria.'}
                  </p>
                  {filters.isFiltered && (
                    <button
                      onClick={filters.clearAll}
                      className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors min-h-[44px]"
                    >
                      <Search className="h-4 w-4" />
                      Clear All Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedProducts.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        imageErrors={imageErrors}
                        setImageErrors={setImageErrors}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="min-w-[44px] min-h-[44px] p-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Previous page"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`min-w-[44px] min-h-[44px] px-4 py-2 rounded-lg font-medium transition-colors ${
                              currentPage === pageNum
                                ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-primary/40'
                            }`}
                            aria-label={`Page ${pageNum}`}
                            aria-current={currentPage === pageNum ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="min-w-[44px] min-h-[44px] p-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Next page"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </nav>
                  )}
                </>
              )}
            </main>
          </div>
        </div>

        <Footer />
        <BottomNav />
      </div>
    </>
  );
}

export default function ShopPage() {
  return <ShopContent />;
}
