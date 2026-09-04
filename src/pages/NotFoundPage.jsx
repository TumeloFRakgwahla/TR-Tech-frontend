import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { Search, Home, ShoppingBag, Smartphone } from 'lucide-react';
import { useState } from 'react';

export default function NotFoundPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const quickLinks = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: ShoppingBag },
    { label: 'Smartphones', href: '/shop?category=Smartphones', icon: Smartphone },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Seo title="404 — Page Not Found" noindex />
      <main className="flex-1 flex items-center justify-center px-4 pt-16 md:pt-20">
        <div className="text-center max-w-md w-full">
          <h1 className="text-6xl font-bold text-primary mb-4" aria-hidden="true">404</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8">
            Sorry, we couldn't find the page you're looking for. It might have been removed, renamed, or doesn't exist.
          </p>

          <form onSubmit={handleSearch} className="mb-6">
            <label htmlFor="not-found-search" className="sr-only">Search for products or pages</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="not-found-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground/50 min-h-[44px]"
              />
            </div>
          </form>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors min-h-[44px]"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors min-h-[44px]"
            >
              <ShoppingBag className="h-4 w-4" />
              Browse Shop
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors min-h-[36px]"
              >
                {link.icon && <link.icon className="h-3 w-3" />}
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
