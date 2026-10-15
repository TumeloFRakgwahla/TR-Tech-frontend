import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';
import { SORT_OPTIONS } from '../../constants';

export function ShopSortDropdown({ value, onChange, className = '' }) {
  return (
    <Select value={value} onValueChange={onChange} className={className}>
      <SelectTrigger className="w-[200px] min-h-[44px] bg-white border-slate-200 hover:border-primary/40 text-slate-900 focus:ring-primary/30">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent className="bg-white border-slate-200">
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}