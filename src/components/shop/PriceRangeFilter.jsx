import React, { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';

const PRICE_STEP = 100;

export function PriceRangeFilter({ minPrice, maxPrice, onChange, disabled = false }) {
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMinChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMinInput(value ? Number(value) : 0);
  }, []);

  const handleMaxChange = useCallback((e) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setMaxInput(value ? Number(value) : 0);
  }, []);

  const handleMinBlur = useCallback(() => {
    setIsEditingMin(false);
    const clamped = Math.min(Math.max(0, minInput), maxPrice);
    onChange?.('min', clamped);
  }, [minInput, maxPrice, onChange]);

  const handleMaxBlur = useCallback(() => {
    setIsEditingMax(false);
    const clamped = Math.min(Math.max(0, maxInput), maxPrice);
    onChange?.('max', clamped);
  }, [maxInput, maxPrice, onChange]);

  const handleMinKeyDown = useCallback((e) => {
    if (e.key === 'Enter') e.target.blur();
  }, []);

  const handleMaxKeyDown = useCallback((e) => {
    if (e.key === 'Enter') e.target.blur();
  }, []);

  const handleMinFocus = useCallback(() => setIsEditingMin(true), []);
  const handleMaxFocus = useCallback(() => setIsEditingMax(true), []);

  const resetToDefaults = useCallback(() => {
    onChange?.('min', 0);
    onChange?.('max', maxPrice);
  }, [maxPrice, onChange]);

  const formatPrice = (price) => `R${price.toLocaleString()}`;

  return (
    <div className="space-y-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-900">Price Range</span>
          {(minPrice > 0 || maxPrice < maxPrice) && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold ring-1 ring-primary/20">
              Active
            </span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-64 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="px-4">
          {/* Min/Max Inputs */}
          <div className="flex items-center justify-between mb-5 gap-3">
            <div className="flex-1 text-center">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Min</span>
              <div className="mt-1">
                <input
                  type="text"
                  value={isEditingMin ? minInput : formatPrice(minPrice)}
                  onChange={handleMinChange}
                  onBlur={handleMinBlur}
                  onKeyDown={handleMinKeyDown}
                  onFocus={handleMinFocus}
                  disabled={disabled}
                  className={`w-full px-3 py-2 bg-slate-100 rounded-lg text-sm font-semibold text-slate-700 text-center ${
                    isEditingMin ? 'outline-none text-primary bg-white ring-2 ring-primary/30' : 'cursor-pointer hover:bg-primary/10 hover:ring-2 hover:ring-primary/30 transition-all'
                  }`}
                  readOnly={!isEditingMin}
                  autoFocus={isEditingMin}
                />
              </div>
            </div>
            <div className="h-px w-6 bg-slate-300 mt-5" />
            <div className="flex-1 text-center">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Max</span>
              <div className="mt-1">
                <input
                  type="text"
                  value={isEditingMax ? maxInput : formatPrice(maxPrice)}
                  onChange={handleMaxChange}
                  onBlur={handleMaxBlur}
                  onKeyDown={handleMaxKeyDown}
                  onFocus={handleMaxFocus}
                  disabled={disabled}
                  className={`w-full px-3 py-2 bg-slate-100 rounded-lg text-sm font-bold text-primary text-center ${
                    isEditingMax ? 'outline-none text-primary bg-white ring-2 ring-primary/30' : 'cursor-pointer hover:bg-primary/10 hover:ring-2 hover:ring-primary/30 transition-all'
                  }`}
                  readOnly={!isEditingMax}
                  autoFocus={isEditingMax}
                />
              </div>
            </div>
          </div>

          {/* Custom Range Slider */}
          <div className="relative h-6 flex items-center">
            <div className="absolute inset-x-0 h-1.5 bg-slate-200 rounded-full" />
            <div
              className="absolute h-1.5 bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all"
              style={{ left: `${(minPrice / maxPrice) * 100}%`, right: `${(1 - maxPrice / maxPrice) * 100}%` }}
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={PRICE_STEP}
              value={minPrice}
              onChange={(e) => onChange?.('min', Number(e.target.value))}
              disabled={disabled}
              className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer z-10"
              aria-label="Minimum price"
              aria-valuemin={0}
              aria-valuemax={maxPrice}
              aria-valuenow={minPrice}
            />
            <input
              type="range"
              min={0}
              max={maxPrice}
              step={PRICE_STEP}
              value={maxPrice}
              onChange={(e) => onChange?.('max', Number(e.target.value))}
              disabled={disabled}
              className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer z-10"
              aria-label="Maximum price"
              aria-valuemin={0}
              aria-valuemax={maxPrice}
              aria-valuenow={maxPrice}
            />
            <div
              className="absolute w-5 h-5 bg-white border-[3px] border-primary rounded-full shadow-md -translate-x-1/2 pointer-events-none transition-transform hover:scale-125"
              style={{ left: `${(minPrice / maxPrice) * 100}%` }}
            />
            <div
              className="absolute w-5 h-5 bg-white border-[3px] border-primary rounded-full shadow-md -translate-x-1/2 pointer-events-none transition-transform hover:scale-125"
              style={{ left: `${(maxPrice / maxPrice) * 100}%` }}
            />
          </div>

          <div className="flex justify-between mt-2.5 px-0.5">
            <span className="text-xs text-slate-500 font-medium">R0</span>
            <span className="text-xs text-slate-500 font-medium">R{Math.round(maxPrice / 2).toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">R{maxPrice.toLocaleString()}</span>
          </div>

          {/* Quick preset buttons */}
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/80">
            <button
              type="button"
              onClick={() => onChange?.('min', 0)}
              disabled={disabled}
              className="flex-1 text-xs font-medium text-slate-600 hover:text-primary py-2 px-3 rounded-lg bg-slate-50 hover:bg-primary/5 transition-colors"
            >
              Min: R0
            </button>
            <button
              type="button"
              onClick={() => onChange?.('max', maxPrice)}
              disabled={disabled}
              className="flex-1 text-xs font-medium text-slate-600 hover:text-primary py-2 px-3 rounded-lg bg-slate-50 hover:bg-primary/5 transition-colors"
            >
              Max: R{maxPrice.toLocaleString()}
            </button>
            <button
              type="button"
              onClick={resetToDefaults}
              disabled={disabled}
              className="flex-1 text-xs font-medium text-rose-600 hover:text-rose-700 py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}