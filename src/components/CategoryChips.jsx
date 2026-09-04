import { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  Headphones,
  Gamepad2,
  Wifi,
  Printer,
  HardDrive,
  MoreHorizontal,
  Monitor,
  Tablet,
  Camera,
  Speaker,
  Cable,
  Battery,
  Mouse,
  Keyboard,
} from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { FALLBACK_CATEGORIES } from '../constants';
import { useScrollIndicators } from '../hooks/useScrollIndicators';

export const iconMap = {
  Smartphone: Smartphone,
  Laptop: Laptop,
  Headphones: Headphones,
  Gamepad2: Gamepad2,
  Wifi: Wifi,
  Printer: Printer,
  HardDrive: HardDrive,
  Monitor: Monitor,
  Tablet: Tablet,
  Camera: Camera,
  Speaker: Speaker,
  Cable: Cable,
  Battery: Battery,
  Mouse: Mouse,
  Keyboard: Keyboard,
  MoreHorizontal: MoreHorizontal,
};

export const categoryStyles = {
  Smartphone: { gradient: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-600' },
  Laptop: { gradient: 'from-violet-500/10 to-purple-500/10', iconColor: 'text-violet-600' },
  Headphones: { gradient: 'from-emerald-500/10 to-green-500/10', iconColor: 'text-emerald-600' },
  Gamepad2: { gradient: 'from-rose-500/10 to-pink-500/10', iconColor: 'text-rose-600' },
  Wifi: { gradient: 'from-sky-500/10 to-blue-500/10', iconColor: 'text-sky-600' },
  Printer: { gradient: 'from-slate-500/10 to-gray-500/10', iconColor: 'text-slate-600' },
  HardDrive: { gradient: 'from-teal-500/10 to-cyan-500/10', iconColor: 'text-teal-600' },
  Monitor: { gradient: 'from-indigo-500/10 to-blue-500/10', iconColor: 'text-indigo-600' },
  Tablet: { gradient: 'from-orange-500/10 to-amber-500/10', iconColor: 'text-orange-600' },
  Camera: { gradient: 'from-pink-500/10 to-rose-500/10', iconColor: 'text-pink-600' },
  Speaker: { gradient: 'from-yellow-500/10 to-orange-500/10', iconColor: 'text-yellow-600' },
  Cable: { gradient: 'from-amber-500/10 to-yellow-500/10', iconColor: 'text-amber-600' },
  Battery: { gradient: 'from-green-500/10 to-emerald-500/10', iconColor: 'text-green-600' },
  Mouse: { gradient: 'from-cyan-500/10 to-teal-500/10', iconColor: 'text-cyan-600' },
  Keyboard: { gradient: 'from-purple-500/10 to-violet-500/10', iconColor: 'text-purple-600' },
  MoreHorizontal: { gradient: 'from-muted-foreground/10 to-muted/10', iconColor: 'text-muted-foreground' },
};

function CategoryChip({ category, isActive }) {
  const name = category.name || category;
  const slug = category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const iconName = category.icon || 'MoreHorizontal';
  const Icon = iconMap[iconName] || MoreHorizontal;
  const style = categoryStyles[iconName] || categoryStyles.MoreHorizontal;

  return (
    <Link
      to={`/shop?category=${encodeURIComponent(slug)}`}
      className={`
        group relative flex flex-col items-center justify-center gap-2
        w-[88px] sm:w-[104px] flex-shrink-0
        px-2 py-3 sm:px-3 sm:py-4
        rounded-2xl border transition-all duration-200 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2
        ${isActive
          ? 'bg-primary/5 border-primary/20 shadow-sm'
          : 'bg-card border-border/60 hover:border-primary/20 hover:bg-primary/[0.03] hover:shadow-sm active:scale-[0.97]'
        }
      `}
      aria-current={isActive ? 'page' : undefined}
    >
      <div
        className={`
          w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0
          transition-all duration-200
          ${isActive
            ? `bg-gradient-to-br ${style.gradient} shadow-inner`
            : `bg-gradient-to-br from-muted/80 to-muted group-hover:bg-gradient-to-br group-hover:${style.gradient}`
          }
        `}
      >
        <Icon
          className={`
            h-5 w-5 sm:h-[22px] sm:w-[22px] transition-colors duration-200
            ${isActive ? style.iconColor : 'text-foreground/70 group-hover:' + style.iconColor}
          `}
          strokeWidth={isActive ? 2.2 : 2}
        />
      </div>

      <span
        className={`
          text-xs font-medium text-center
          leading-tight tracking-tight
          line-clamp-2 min-h-[28px] sm:min-h-[32px]
          flex items-center justify-center
          transition-colors duration-200
          ${isActive ? 'text-primary font-semibold' : 'text-foreground/80 group-hover:text-foreground'}
        `}
      >
        {name}
      </span>

      {isActive && (
        <span className="absolute -bottom-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
      )}
    </Link>
  );
}

export default function CategoryChips() {
  const [categories, setCategories] = useState([]);
  const [searchParams] = useSearchParams();
  const { ref, className } = useScrollIndicators();

  const activeCategory = searchParams.get('category');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          setCategories([]);
        }
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();

    const handler = (e) => {
      if (e.detail?.type === 'categories') {
        fetchCategories();
      }
    };
    window.addEventListener('admin-data-changed', handler);
    return () => window.removeEventListener('admin-data-changed', handler);
  }, []);

  const isDesktopGrid = useMemo(() => categories.length <= 8, [categories.length]);

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 px-4">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-muted-foreground/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-sm text-muted-foreground font-medium">No categories available</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Categories will appear here once added</p>
      </div>
    );
  }

  if (isDesktopGrid) {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3 max-w-md sm:max-w-2xl lg:max-w-4xl mx-auto">
        {categories.map((category) => {
          const name = category.name || category;
          const slug = category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
          const isActive = activeCategory === slug;
          return <CategoryChip key={slug} category={category} isActive={isActive} />;
        })}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth snap-x snap-mandatory px-4 ${className}`}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {categories.map((category) => {
        const name = category.name || category;
        const slug = category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const isActive = activeCategory === slug;
        return (
          <div key={slug} className="snap-start">
            <CategoryChip category={category} isActive={isActive} />
          </div>
        );
      })}
    </div>
  );
}
