import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, X } from 'lucide-react';

export function FilterSidebar({ 
  filters, 
  maxPrice, 
  categories, 
  brands, 
  sortBy: _sortBy,
  onSortChange
}) {
  const {
    selectedCategories, toggleCategory,
    selectedBrands, toggleBrand,
    inStockOnly, setInStockOnly,
    priceRange, setPriceRange,
    minRating, setMinRating,
    onSaleOnly, setOnSaleOnly,
    newArrivalsOnly, setNewArrivalsOnly,
    clearAll, isFiltered,
  } = filters;

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    stock: true,
    rating: true,
    sale: true,
    newArrivals: true,
  });

  const toggleSection = useCallback((section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const [priceInputValue, setPriceInputValue] = useState(priceRange);
  const [isEditingPrice, setIsEditingPrice] = useState(false);

  useEffect(() => {
    if (!isEditingPrice) {
      setPriceInputValue(priceRange);
    }
  }, [priceRange, isEditingPrice]);

  const handlePriceInputChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setPriceInputValue(value ? Number(value) : 0);
  }, []);

  const handlePriceInputBlur = useCallback(() => {
    setIsEditingPrice(false);
    setPriceRange(Math.min(Math.max(0, priceInputValue), maxPrice));
  }, [priceInputValue, maxPrice, setPriceRange]);

  const handlePriceInputKeyDown = useCallback((e) => {
    if (e.key === 'Enter') e.target.blur();
  }, []);

  const totalActiveFilters = selectedCategories.length + selectedBrands.length + (inStockOnly ? 1 : 0) + (priceRange < maxPrice ? 1 : 0) + (minRating > 0 ? 1 : 0) + (onSaleOnly ? 1 : 0) + (newArrivalsOnly ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex-1">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 18a1 1 0 001-1v-2.586a1 1 0 01.293-.707l6.414-6.414a1 1 0 00.293-.707V5a1 1 0 00-1-1H9a1 1 0 00-1 1v12.586a1 1 0 01-.293.707L5.707 15.293A1 1 0 015 14.586V17a1 1 0 011 1h4z" />
              </svg>
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ring-1 ring-blue-200"
              >
                {brand}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
            {priceRange < maxPrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary ring-1 ring-primary/20">
                Max R{priceRange.toLocaleString()}
                <button
                  onClick={() => setPriceRange(maxPrice)}
                  className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove price filter, showing up to R${maxPrice.toLocaleString()}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 ring-1 ring-amber-200">
                {minRating === 5 ? '5 Stars' : `${minRating} Stars & Up`}
                <button
                  onClick={() => {
                    setMinRating(0);
                    onSortChange('featured');
                  }}
                  className="ml-0.5 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${minRating} star filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {onSaleOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                On Sale
                <button
                  onClick={() => setOnSaleOnly(false)}
                  className="ml-0.5 hover:bg-rose-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remove sale filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {newArrivalsOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 ring-1 ring-blue-200">
                New Arrivals
                <button
                  onClick={() => {
                    setNewArrivalsOnly(false);
                    onSortChange('featured');
                  }}
                  className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label="Remove new arrivals filter"
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
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
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
                        isSelected ? 'bg-blue-50/[0.06]' : 'hover:bg-slate-50'
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
                            ? 'bg-blue-600 border-blue-600'
                            : 'border-slate-300 group-hover:border-blue-400/50'
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
                  step={100}
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

        {/* Rating Section */}
        <div className="px-5 py-4">
          <button
            onClick={() => toggleSection('rating')}
            className="w-full flex items-center justify-between group"
            aria-expanded={expandedSections.rating}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">Rating</span>
              {minRating > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-semibold ring-1 ring-amber-200">
                  {minRating === 5 ? '5' : `${minRating}+`}
                </span>
              )}
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${expandedSections.rating ? 'rotate-180' : ''}`} />
          </button>
          <div className={`overflow-hidden transition-all duration-300 ${expandedSections.rating ? 'max-h-48 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
            <div className="space-y-1.5">
              {[5, 4, 3].map((rating) => (
                <label
                  key={rating}
                  className={`flex items-center gap-3 cursor-pointer py-2 px-2.5 rounded-lg transition-all ${
                    minRating === rating ? 'bg-amber-50 ring-1 ring-amber-200' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <input
                      type="radio"
                      name="rating-filter"
                      checked={minRating === rating}
                      onChange={() => {
                        setMinRating(rating);
                        onSortChange('rating');
                      }}
                      className="sr-only peer"
                    />
                    <div className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      minRating === rating
                        ? 'border-amber-500 scale-100'
                        : 'border-slate-300 peer-hover:border-amber-400 scale-100'
                    }`}>
                      {minRating === rating && (
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </div>
                  </div>
                  <span className={`text-sm transition-colors flex-1 ${
                    minRating === rating ? 'text-slate-900 font-semibold' : 'text-slate-600'
                  }`}>
                    {rating === 5 ? '5 Stars' : `${rating} Stars & Up`}
                  </span>
                  <span className="text-xs text-slate-400">{rating === 5 ? 'Only' : 'Minimum'}</span>
                </label>
              ))}
{minRating > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMinRating(0);
                    onSortChange('featured');
                  }}
                  className="w-full text-left text-xs font-medium text-slate-500 hover:text-slate-700 py-2 px-2.5 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Clear rating filter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* On Sale Section */}
        <div className="px-5 py-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={onSaleOnly}
                  onChange={e => setOnSaleOnly(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                  onSaleOnly ? 'bg-rose-500' : 'bg-slate-200'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    onSaleOnly ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900">On Sale</span>
                <p className="text-xs text-slate-500">Show discounted products only</p>
              </div>
            </div>
            {onSaleOnly && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-semibold">
                On
              </span>
            )}
          </label>
        </div>

        {/* New Arrivals Section */}
        <div className="px-5 py-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={newArrivalsOnly}
                  onChange={() => {
                    const next = !newArrivalsOnly;
                    setNewArrivalsOnly(next);
                    onSortChange(next ? 'newest' : 'featured');
                  }}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${
                  newArrivalsOnly ? 'bg-blue-500' : 'bg-slate-200'
                }`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                    newArrivalsOnly ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-slate-900">New Arrivals</span>
                <p className="text-xs text-slate-500">Latest products first</p>
              </div>
            </div>
            {newArrivalsOnly && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-semibold">
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
