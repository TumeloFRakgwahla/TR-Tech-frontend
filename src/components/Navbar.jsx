/**
 * TR-Tech — Primary Navigation Bar
 *
 * A responsive navbar that adapts between desktop and mobile layouts.
 * Key responsibilities:
 * - Global site navigation with active-link highlighting
 * - Persistent cart, wishlist, and account state from React contexts
 * - Expandable mobile search overlay
 * - Slide-out mobile menu with category drill-down
 * - Account dropdown for authenticated users
 *
 * State:
 * - isOpen: controls mobile menu visibility and body scroll lock
 * - accountDropdownOpen: desktop account menu dropdown
 * - searchExpanded: mobile search bar expansion
 * - categories/categoriesOpen: fetched categories for mobile menu
 */

import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Heart, User, LogOut, ShoppingCart, Search, ChevronDown, Smartphone, Wrench, Mail, Info, Home, ShoppingBag, PhoneIcon, WrenchIcon, Phone, Book } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MiniCart } from './MiniCart';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { toast } from 'sonner';
import { categoriesAPI } from '../services/api';

/**
 * Individual navigation link with active-state underline indicator.
 * Matches exact path for desktop links and parent-path for mobile sections.
 */
const NavLink = ({ to, children, className = '', onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative group transition-colors ${isActive ? 'text-white font-semibold' : 'hover:text-accent'} ${className}`}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white rounded-full" />
      )}
      {!isActive && (
        <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent/0 group-hover:bg-accent rounded-full transition-colors" />
      )}
    </Link>
  );
};

/**
 * Main Navbar component.
 *
 * Desktop layout: logo | nav links | actions (wishlist, cart, account)
 * Mobile layout: logo | search, wishlist, cart, account icons | hamburger menu
 */
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Context values drive badge counts and auth state across the navbar
  const { wishlistCount } = useWishlist();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  /**
   * Lock body scroll when mobile menu is open to prevent background scrolling.
   * Cleanup resets overflow on unmount or menu close.
   */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  /**
   * Auto-focus the search input when the mobile search bar expands.
   */
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchExpanded]);

  /**
   * Navigate to shop with search query when Enter is pressed in mobile search.
   */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (searchExpanded && e.key === 'Enter' && searchQuery.trim()) {
        navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchExpanded(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchExpanded, searchQuery, navigate]);

  /**
   * Fetch active categories from the backend for the mobile menu drill-down.
   * Also listens for admin data changes to refresh categories dynamically.
   */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          setCategories(res.data.map(c => c.name));
        }
      } catch {
        // keep empty — mobile menu degrades gracefully
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

  /**
   * Account button handler: navigate to account if logged in,
   * otherwise open the auth modal. Always close mobile menu.
   */
  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      openAuthModal();
    }
    setAccountDropdownOpen(false);
    setIsOpen(false);
  };

  /**
   * Logout handler: clears auth state, closes dropdowns, shows toast.
   */
  const handleLogout = () => {
    logout();
    setAccountDropdownOpen(false);
    setIsOpen(false);
    toast.success('Logged out successfully');
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <div className="flex items-center">
            <Link to="/">
              <img
                src="/TR_Tech_logo.png"
                alt="TR-Tech Logo"
                className="h-14 md:h-20 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
          </div>

          {/* Desktop navigation links and action buttons */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/shop">Shop</NavLink>
            <NavLink to="/contact">Contact</NavLink>
            <Link
              to="/book-repair"
              className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-200 hover:shadow-md transition-all"
            >
              Book Repair
            </Link>
            <Link
              to="/wishlist"
              className="relative cursor-pointer bg-white text-primary hover:bg-gray-200 hover:shadow-md rounded-md px-4 py-2 inline-flex items-center justify-center transition-all"
            >
              <Heart className="h-6 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <div className="hidden sm:block">
              <MiniCart />
            </div>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 bg-white text-primary px-3 py-2 rounded-md hover:bg-gray-200 transition-all min-h-[44px]"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(user?.firstName || 'U').charAt(0)}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">{user?.firstName || 'Account'}</span>
                </button>
                {accountDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/account"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                      >
                        <Heart className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        to="/account/repairs"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 min-h-[44px]"
                      >
                        <User className="h-4 w-4" />
                        Repairs
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 min-h-[44px]"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={handleAccountClick}
                className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-200 hover:shadow-md transition-all min-h-[44px]"
              >
                My Account
              </button>
            )}
          </div>

          {/* Mobile action icons */}
          <div className="md:hidden flex items-center">
            {searchExpanded ? (
              <div className="absolute inset-x-0 top-0 bg-primary p-2 z-50 flex items-center gap-2">
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 h-10 px-4 rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  onBlur={() => {
                    if (!searchQuery.trim()) {
                      setSearchExpanded(false);
                    }
                  }}
                  aria-label="Search products"
                />
                <button
                  onClick={() => {
                    setSearchExpanded(false);
                    setSearchQuery('');
                  }}
                  className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-foreground"
                  aria-label="Close search"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchExpanded(true)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
            )}
            <Link
              to="/wishlist"
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              className="relative p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="View cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleAccountClick}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="My Account"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.firstName || 'U').charAt(0)}
                </div>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile slide-out menu with backdrop, categories, and account section */}
        <div
          className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isOpen}
        >
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-menu"
            className={`absolute inset-x-0 top-16 bg-primary border-t border-primary-foreground/20 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-200 ${
              isOpen ? 'translate-y-0' : '-translate-y-4'
            }`}
          >

            <div className="px-4 pt-2 pb-6 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40 mb-2">Main</p>
              <NavLink to="/" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                <Home className="h-5 w-5 mr-3" />Home
              </NavLink>
              <NavLink to="/shop" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                <ShoppingBag className="h-5 w-5 mr-3" />Shop
              </NavLink>

              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full flex items-center justify-between px-4 py-3.5 text-lg text-primary-foreground hover:text-accent transition-colors min-h-[48px]"
              >
                <span className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-3" />Categories
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>
              {categoriesOpen && categories.length > 0 && (
                <div className="pl-12 pr-4 space-y-1">
                  {categories.map(cat => (
                    <Link
                      key={cat}
                      to={`/shop?category=${encodeURIComponent(cat)}`}
                      className="block py-2.5 text-sm text-primary-foreground/80 hover:text-accent transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              )}

              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40 mb-2 mt-4">Services</p>
              <NavLink to="/services" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                <Wrench className="h-5 w-5 mr-3" />Services
              </NavLink>
              <Link
                to="/book-repair"
                className="block px-4 py-3.5 text-lg text-accent hover:text-white transition-colors min-h-[48px] flex items-center font-medium"
                onClick={() => setIsOpen(false)}
              >
                <Book className="h-5 w-5 mr-3" />Book a Repair
              </Link>
              <Link
                to="/account/repairs"
                className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <Mail className="h-5 w-5 mr-3" />Track Repair
              </Link>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40 mb-2 mt-4">Support</p>
              <NavLink to="/contact" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                <Phone className="h-5 w-5 mr-3" />Contact
              </NavLink>
              <NavLink to="/about" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                <Info className="h-5 w-5 mr-3" />About
              </NavLink>
            </div>

            {/* Account section in mobile menu — conditional on auth state */}
            {isAuthenticated ? (
              <div className="px-4 pb-6 space-y-1 border-t border-primary-foreground/10 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/40 mb-2">Account</p>
                <NavLink to="/account" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                  <User className="h-5 w-5 mr-3" />My Account
                </NavLink>
                <NavLink to="/account/orders" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                  <ShoppingCart className="h-5 w-5 mr-3" />Orders
                </NavLink>
                <NavLink to="/account/repairs" className="block px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center" onClick={() => setIsOpen(false)}>
                  <Wrench className="h-5 w-5 mr-3" />Repairs
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3.5 text-lg text-red-400 hover:text-red-300 transition-colors min-h-[48px] flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-3" />Logout
                </button>
              </div>
            ) : (
              <div className="px-4 pb-6 border-t border-primary-foreground/10 pt-4">
                <button
                  onClick={handleAccountClick}
                  className="block w-full text-left px-4 py-3.5 text-lg hover:text-accent transition-colors min-h-[48px] flex items-center"
                >
                  <User className="h-5 w-5 mr-3" />My Account
                </button>
              </div>
            )}

            {/* Sticky bottom CTA inside mobile menu */}
            <div className="sticky bottom-0 bg-primary p-4 border-t border-primary-foreground/20">
              <Link
                to="/book-repair"
                className="block w-full text-center bg-white text-primary py-3.5 rounded-md font-semibold hover:bg-gray-200 transition-colors min-h-[48px] flex items-center justify-center"
                onClick={() => setIsOpen(false)}
              >
                Book a Repair
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
