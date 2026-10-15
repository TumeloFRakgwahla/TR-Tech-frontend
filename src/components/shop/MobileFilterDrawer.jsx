import React, { useEffect, useRef } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { FilterSidebar } from './FilterSidebar';

export function MobileFilterDrawer({ 
  isOpen, 
  onClose, 
  filters, 
  maxPrice, 
  categories, 
  brands, 
  sortBy,
  onSortChange
}) {
  const dialogRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Lock body scroll
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

    // Focus trap setup
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = dialog.querySelectorAll(focusableSelectors);
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
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
      previousActiveElement.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        id="mobile-filters"
        role="dialog"
        aria-modal="true"
        aria-label="Product filters"
        className="fixed inset-x-0 bottom-0 top-16 lg:top-20 z-50 bg-white shadow-2xl max-h-full flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/80 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Close filters"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain pb-safe">
          <FilterSidebar
            filters={filters}
            maxPrice={maxPrice}
            categories={categories}
            brands={brands}
            sortBy={sortBy}
            onSortChange={onSortChange}
          />
        </div>

        {/* Sticky Footer Actions */}
        <div className="border-t border-slate-200/80 bg-slate-50/50 p-4 pb-safe sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary/90"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Apply Filters</span>
          </button>
        </div>
      </div>
    </>
  );
}



