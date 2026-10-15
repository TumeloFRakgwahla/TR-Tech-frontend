import React, { useState, useEffect, useCallback } from 'react';
import { Smartphone, Laptop, Headphones, Cable, Tag, MoreHorizontal } from 'lucide-react';
import { categoriesAPI } from '../../services/api';

const CATEGORY_ICONS = {
  Smartphones: Smartphone,
  Laptops: Laptop,
  'Phone Accessories': Headphones,
  'Mobile Accessories': Headphones,
  'Computer Accessories': Cable,
  'Laptop Accessories': Cable,
  Gaming: Tag,
  'Special Offers': Tag,
};

export function ShopCategoryTabs({ selectedCategories = [], onCategoryChange, categories: propCategories, className = '' }) {
  const [categories, setCategories] = useState(propCategories || []);

  useEffect(() => {
    if (propCategories && propCategories.length > 0) {
      setCategories(propCategories);
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          const catNames = res.data.map(c => c.name);
          setCategories(catNames.length ? [...new Set(catNames)] : []);
        }
      } catch {
        // Fallback handled below
      }
    };
    fetchCategories();

    const handler = (e) => {
      if (e.detail?.type === 'categories') fetchCategories();
    };
    window.addEventListener('admin-data-changed', handler);
    return () => window.removeEventListener('admin-data-changed', handler);
  }, [propCategories]);

  // Add special offers as a virtual category
  const allCategories = [
    { name: 'All', icon: MoreHorizontal },
    ...categories.map(name => ({
      name,
      icon: CATEGORY_ICONS[name] || MoreHorizontal,
    })),
    { name: 'Special Offers', icon: Tag },
  ];

  const handleCategoryClick = useCallback((categoryName) => {
    const isSelected = selectedCategories.includes(categoryName);

    if (categoryName === 'All') {
      onCategoryChange?.('');
    } else if (isSelected) {
      onCategoryChange?.([].concat(selectedCategories.filter(c => c !== categoryName)));
    } else {
      onCategoryChange?.([].concat(selectedCategories, categoryName));
    }
  }, [selectedCategories, onCategoryChange]);

  return (
    <div 
      role="group" 
      aria-label="Product categories"
      className={`flex gap-2 overflow-x-auto scrollbar-hide pb-2 ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {allCategories.map(({ name, icon: Icon }) => {
        const isSelected =
          name === 'All'
            ? selectedCategories.length === 0
            : selectedCategories.includes(name);
        return (
          <button
            key={name}
            type="button"
            onClick={() => handleCategoryClick(name)}
             aria-pressed={isSelected}
             className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[32px] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
              isSelected
                ? 'bg-primary text-white shadow-sm shadow-primary/25 hover:shadow-md'
                : name === 'Special Offers'
                ? 'bg-white text-slate-600 border border-slate-200 hover:border-rose-400 hover:text-rose-600 ring-1 ring-rose-200/50'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary/40 hover:text-primary'
            }`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{name}</span>
          </button>
        );
      })}
    </div>
  );
}