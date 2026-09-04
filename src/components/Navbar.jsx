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

import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, User, LogOut, ShoppingCart, ChevronDown, Smartphone, Wrench, Info, Home, ShoppingBag, Phone, Book, ChevronRight, Package } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MiniCart } from './MiniCart';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { toast } from 'sonner';
import { categoriesAPI } from '../services/api';

/**
 * Individual navigation link with active-state underline indicator.
 * Matches exact path for desktop links and parent-path for mobile sections.
 */
const NavLink = ({ to, children, className = '', onClick, isMobile = false }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative group transition-colors ${isActive ? (isMobile ? 'text-primary font-semibold' : 'text-white font-semibold') : (isMobile ? 'text-foreground' : 'hover:text-accent')} ${className}`}
      onClick={onClick}
    >
      {children}
      {isActive && (
        <span className={`absolute -bottom-1 left-0 right-0 h-0.5 rounded-full ${isMobile ? 'bg-primary' : 'bg-white'}`} />
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
  const [categories, setCategories] = useState([]);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const hamburgerButtonRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);

  // Context values drive badge counts and auth state across the navbar
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

  /**
   * Focus management for the mobile menu (ARIA dialog pattern).
   * On open: move focus to the close button inside the panel.
   * On close: return focus to the hamburger trigger that opened it.
   */
  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    } else {
      hamburgerButtonRef.current?.focus();
    }
  }, [isOpen]);

  /**
   * Lock body scroll when mobile menu is open to prevent background scrolling.
   * Uses the fixed-position + scrollY-preservation pattern so that:
   *   1. iOS Safari rubber-band scroll is prevented
   *   2. The user's scroll position is restored on close (no jump to top)
   * Cleanup restores the original styles and scroll position.
   */
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const originalStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = originalStyles.position;
      body.style.top = originalStyles.top;
      body.style.width = originalStyles.width;
      body.style.overflow = originalStyles.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

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
         } else {
           setCategories(['Smartphones', 'Laptops', 'Gaming', 'Printers', 'Storage Devices', 'Mobile Accessories']);
         }
       } catch {
         setCategories(['Smartphones', 'Laptops', 'Gaming', 'Printers', 'Storage Devices', 'Mobile Accessories']);
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
                loading="eager"
                fetchPriority="high"
                decoding="async"
              />
            </Link>
          </div>

          {/* Desktop navigation links and action buttons (>= 1024 px) */}
          <div className="hidden lg:flex items-center space-x-6">
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
            <div className="hidden sm:block opacity-0 sm:opacity-100 transition-opacity duration-200">
              <MiniCart />
            </div>
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 bg-white text-primary px-3 py-2 rounded-md hover:bg-gray-200 transition-all min-h-[44px]"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {(user?.firstName?.trim()?.charAt(0) || 'U')}
                  </div>
                  <span className="text-sm font-medium hidden lg:inline">
                    {(user?.firstName?.trim() || 'Account')}
                  </span>
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

          {/* Mobile/tablet action icons (shown below lg breakpoint) */}
          <div className="lg:hidden flex items-center text-primary-foreground">
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
              ref={hamburgerButtonRef}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 -ml-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile/tablet slide-out menu with backdrop, categories, and account section */}
        <div
          className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${
            isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          aria-hidden={!isOpen}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Main navigation"
            className={`absolute inset-x-0 top-0 bottom-0 bg-white shadow-2xl max-w-sm w-[85vw] flex flex-col transition-transform duration-300 ease-out ${
              isOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Mobile Menu Header */}
            <div className="bg-primary text-primary-foreground px-5 pt-safe pt-4 pb-4 flex items-center justify-between">
              <Link to="/" onClick={() => setIsOpen(false)} className="flex items-center gap-3">
                <img
                  src="/TR_Tech_logo.png"
                  alt="TR-Tech Logo"
                  className="h-12 w-auto"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <button
                ref={closeButtonRef}
                onClick={() => setIsOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-primary-foreground/80 hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* User Greeting Section */}
            {isAuthenticated && (
              <div className="bg-gradient-to-r from-primary to-primary/90 px-5 py-4 border-b border-primary-foreground/10">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white text-base font-bold ring-2 ring-white/30">
                    {(user?.firstName || 'U').charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">Welcome back,</p>
                    <p className="text-white/80 text-xs">{user?.firstName || 'User'} {user?.lastName || ''}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Menu Content */}
            <div className="overflow-y-auto overscroll-contain">
              <div className="py-3">
                <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Navigate</p>
                <NavLink to="/" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                  <span className="flex items-center gap-4">
                    <Home className="h-5 w-5 text-muted-foreground" />Home
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </NavLink>
                <NavLink to="/shop" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                  <span className="flex items-center gap-4">
                    <ShoppingBag className="h-5 w-5 text-muted-foreground" />Shop
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </NavLink>
                <NavLink to="/services" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                  <span className="flex items-center gap-4">
                    <Wrench className="h-5 w-5 text-muted-foreground" />Services
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </NavLink>
                <NavLink to="/contact" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                  <span className="flex items-center gap-4">
                    <Phone className="h-5 w-5 text-muted-foreground" />Contact
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </NavLink>
                <NavLink to="/about" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                  <span className="flex items-center gap-4">
                    <Info className="h-5 w-5 text-muted-foreground" />About
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </NavLink>
              </div>

              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="py-3 border-t border-border">
                  <button
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    className="w-full flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]"
                  >
                    <span className="flex items-center gap-4">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">Categories</span>
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`overflow-hidden transition-all duration-200 ${categoriesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="pl-14 pr-5 pb-2 space-y-0.5">
                      {categories.map(cat => (
                        <Link
                          key={cat}
                          to={`/shop?category=${encodeURIComponent(cat)}`}
                          className="flex items-center justify-between py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          {cat}
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions Section */}
              <div className="py-3 border-t border-border">
                <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Actions</p>
                <Link
                  to="/book-repair"
                  className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-4">
                    <Book className="h-5 w-5 text-accent-foreground" />Book a Repair
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
                <Link
                  to={isAuthenticated ? "/account/repairs" : "#"}
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      openAuthModal();
                    }
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]"
                >
                  <span className="flex items-center gap-4">
                    <Package className="h-5 w-5 text-muted-foreground" />Track Repair
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]"
                  onClick={() => setIsOpen(false)}
                >
                  <span className="flex items-center gap-4">
                    <Heart className="h-5 w-5 text-muted-foreground" />Wishlist
                    {wishlistCount > 0 && (
                      <span className="ml-auto mr-2 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </Link>
              </div>

              {/* Account Section */}
              <div className="py-3 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">My Account</p>
                    <NavLink to="/account" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                      <span className="flex items-center gap-4">
                        <User className="h-5 w-5 text-muted-foreground" />My Profile
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </NavLink>
                    <NavLink to="/account/orders" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                      <span className="flex items-center gap-4">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />My Orders
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </NavLink>
                    <NavLink to="/account/repairs" isMobile={true} className="flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]" onClick={() => setIsOpen(false)}>
                      <span className="flex items-center gap-4">
                        <Wrench className="h-5 w-5 text-muted-foreground" />My Repairs
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-destructive hover:bg-red-50 transition-colors min-h-[48px]"
                    >
                      <span className="flex items-center gap-4">
                        <LogOut className="h-5 w-5" />Sign Out
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <p className="px-5 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">Account</p>
                    <button
                      onClick={handleAccountClick}
                      className="w-full flex items-center justify-between px-5 py-3.5 text-[15px] font-medium text-foreground hover:bg-gray-50 transition-colors min-h-[48px]"
                    >
                      <span className="flex items-center gap-4">
                        <User className="h-5 w-5 text-muted-foreground" />Sign In / Register
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sticky bottom CTA inside mobile menu */}
            <div className="border-t border-border p-4 py bg-white pb-safe">
              <Link
                to="/book-repair"
                className="block w-full text-center bg-primary text-primary-foreground py-3.5 rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors min-h-[48px] flex items-center justify-center shadow-sm"
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
