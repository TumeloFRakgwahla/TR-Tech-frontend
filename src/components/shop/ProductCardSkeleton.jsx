import React from 'react';

export function ProductCardSkeleton() {
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