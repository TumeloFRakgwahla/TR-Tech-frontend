import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';
import { toast } from 'sonner';
import { Input } from './ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { Search, LayoutDashboard, Package, ShoppingCart, Users, Warehouse, Megaphone, BarChart3, UserCog, Wrench, Tags, Building, ArrowRight } from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', keywords: 'home overview stats' },
  { path: '/admin/products', icon: Package, label: 'Products', keywords: 'catalog items inventory list' },
  { path: '/admin/categories', icon: Tags, label: 'Categories', keywords: 'taxonomy groups' },
  { path: '/admin/brands', icon: Building, label: 'Brands', keywords: 'manufacturers makers' },
  { path: '/admin/services', icon: Wrench, label: 'Services', keywords: 'offerings repairs setup' },
  { path: '/admin/repairs', icon: Wrench, label: 'Repairs', keywords: 'fix service tickets jobs' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders', keywords: 'sales purchases checkout' },
  { path: '/admin/customers', icon: Users, label: 'Customers', keywords: 'clients people buyers' },
  { path: '/admin/inventory', icon: Warehouse, label: 'Inventory', keywords: 'stock levels warehouse' },
  { path: '/admin/marketing', icon: Megaphone, label: 'Marketing', keywords: 'coupons campaigns promotions' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports', keywords: 'analytics insights export' },
  { path: '/admin/users', icon: UserCog, label: 'User Management', keywords: 'staff team permissions roles' },
];

const quickActions = [
  { label: 'New Product', icon: Package, action: 'create-product' },
  { label: 'New Order', icon: ShoppingCart, action: 'create-order' },
  { label: 'New Repair', icon: Wrench, action: 'create-repair' },
  { label: 'New Customer', icon: Users, action: 'create-customer' },
];

const RECENT_PAGES_KEY = 'trtech_recent_pages';
const MAX_RECENT = 5;

export function CommandPalette({ open, onOpenChange }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAdminAuth();

  const recentPages = useMemo(() => {
    try {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return [
        ...recentPages.slice(0, MAX_RECENT).map(path => {
          const item = navItems.find(n => n.path === path);
          return item ? { ...item, isRecent: true } : null;
        }).filter(Boolean),
        ...quickActions.map(action => ({ ...action, isAction: true })),
      ];
    }
    const q = query.toLowerCase();
    return [
      ...navItems.filter(
        (item) =>
          item.label.toLowerCase().includes(q) ||
          item.keywords.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q) ||
          `add ${item.label.toLowerCase()}`.includes(q) ||
          `new ${item.label.toLowerCase()}`.includes(q)
      ),
      ...quickActions.filter(action => action.label.toLowerCase().includes(q)),
    ];
  }, [query, recentPages]);

  const trackPage = useCallback((path) => {
    try {
      const stored = localStorage.getItem(RECENT_PAGES_KEY);
      let pages = stored ? JSON.parse(stored) : [];
      pages = [path, ...pages.filter(p => p !== path)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_PAGES_KEY, JSON.stringify(pages));
    } catch {
      // Storage unavailable
    }
  }, []);

  const handleSelect = useCallback(
    (item) => {
      if (item.isAction) {
        toast.info(`${item.label} form coming soon`);
        onOpenChange(false);
        setQuery('');
        return;
      }
      trackPage(item.path);
      navigate(item.path);
      onOpenChange(false);
      setQuery('');
    },
    [navigate, onOpenChange, trackPage]
  );

  useEffect(() => {
    if (!open) setQuery('');
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="px-4 pt-4 pb-2">
          <DialogTitle className="text-white flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            Quick Navigation
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Jump to any admin section or action. Type to filter.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-2">
          <Input
            autoFocus
            placeholder="Search pages, orders, customers, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">No results found</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path || item.action}
                    onClick={() => handleSelect(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-slate-800 transition-colors group"
                  >
                    <div className="h-9 w-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:border-blue-600/50 transition-colors">
                      {Icon && <Icon className="h-4 w-4 text-slate-400 group-hover:text-blue-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {item.isRecent ? 'Recently visited' : item.isAction ? 'Quick create' : item.path}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{user?.firstName ? `Welcome, ${user.firstName}` : 'Admin'}</span>
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-400">ESC</kbd> to close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
