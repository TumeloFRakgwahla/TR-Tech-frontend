import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Gamepad2, Wifi, Printer, HardDrive, MoreHorizontal } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { FALLBACK_CATEGORIES } from '../constants';
import { useScrollIndicators } from '../hooks/useScrollIndicators';

const iconMap = {
  Smartphones: Smartphone,
  Laptops: Laptop,
  'Mobile Accessories': Headphones,
  Gaming: Gamepad2,
  Networking: Wifi,
  Printers: Printer,
  'Storage Devices': HardDrive,
  Other: MoreHorizontal,
};

export default function CategoryChips() {
  const [categories, setCategories] = useState([]);
  const { ref, className } = useScrollIndicators();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          setCategories(FALLBACK_CATEGORIES.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })));
        }
      } catch {
        setCategories(FALLBACK_CATEGORIES.map(name => ({ name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') })));
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

  return (
    <div ref={ref} className={`flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide ${className}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {categories.map((category) => {
        const name = category.name || category;
        const slug = category.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        const Icon = iconMap[name] || MoreHorizontal;
        return (
          <Link
            key={slug}
            to={`/shop?category=${encodeURIComponent(slug)}`}
            className="flex flex-col items-center gap-1.5 min-w-[72px] p-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
