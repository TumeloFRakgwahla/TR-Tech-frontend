import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Headphones, Gamepad2, Wifi, Printer, HardDrive, MoreHorizontal } from 'lucide-react';
import { categoriesAPI } from '../services/api';
import { PRODUCT_CATEGORIES } from '../constants';

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

const slugMap = {
  Smartphones: 'smartphones',
  Laptops: 'laptops',
  'Laptop Accessories': 'laptop-accessories',
  'Mobile Accessories': 'mobile-accessories',
  Gaming: 'gaming',
  Networking: 'networking',
  Printers: 'printers',
  'Storage Devices': 'storage-devices',
  Other: 'other',
};

export default function CategoryChips() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          const catNames = res.data.map((c) => c.name);
          setCategories([...new Set([...PRODUCT_CATEGORIES, ...catNames])]);
        } else {
          setCategories(PRODUCT_CATEGORIES);
        }
      } catch {
        setCategories(PRODUCT_CATEGORIES);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex gap-2 justify-center overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {categories.map((category) => {
        const Icon = iconMap[category] || MoreHorizontal;
        const slug = slugMap[category] || category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        return (
          <Link
            key={slug}
            to={`/shop?category=${encodeURIComponent(category)}`}
            className="flex flex-col items-center gap-1.5 min-w-[72px] p-3 rounded-xl bg-muted/50 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:bg-primary/10 transition-colors">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[11px] font-medium text-foreground whitespace-nowrap">
              {category}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
