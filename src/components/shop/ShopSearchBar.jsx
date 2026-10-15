import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function ShopSearchBar({ value, onChange, onClear, placeholder = 'Search products...', className = '' }) {
  const [localValue, setLocalValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  const handleClear = useCallback(() => {
    setLocalValue('');
    onClear?.();
  }, [onClear]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      handleClear();
      e.target.blur();
    }
  }, [handleClear]);

  return (
    <div className={`relative flex items-center ${className}`}>
      <Search className={`absolute left-3.5 h-5 w-5 text-slate-400 transition-colors ${
        isFocused || localValue ? 'text-primary' : ''
      }`} aria-hidden="true" />
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[44px] pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40
          placeholder:text-slate-400 transition-all duration-200"
        aria-label="Search products"
        autoComplete="off"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}