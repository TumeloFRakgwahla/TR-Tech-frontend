/**
 * TR-Tech — Mobile Bottom Navigation Bar
 *
 * Fixed navigation bar shown only on mobile viewports (below md breakpoint).
 * Provides quick access to the five most important app sections:
 * Home, Shop, Cart, Saved (wishlist), and Account.
 *
 * Behavior:
 * - Active tab is highlighted with a top indicator bar and stronger icon stroke.
 * - Cart and wishlist tabs show badge counts for items in those collections.
 * - Account tab redirects unauthenticated users to the auth modal instead of /account.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';

/**
 * Individual bottom nav button.
 * Renders an icon + label with active-state styling and optional badge.
 */
const NavButton = ({ to, icon: Icon, label, badge, onClick, isActive }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center flex-1 min-h-[60px] py-1.5 transition-all ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
      )}

      <div className="relative">
        <Icon
          className={`h-5 w-5 transition-transform ${isActive ? 'scale-110' : ''}`}
          strokeWidth={isActive ? 2.5 : 2}
        />
        {badge > 0 && (
          <span className="absolute -top-2 -right-3 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 ring-2 ring-background">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      <span className={`text-xs mt-0.5 leading-snug ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </Link>
  );
};

/**
 * BottomNav renders the fixed bottom tab bar on mobile.
 * Hidden on md+ breakpoints via `md:hidden`.
 */
export function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  /**
   * Determines if a given path is "active".
   * Homepage matches exactly; all other paths match by prefix
   * so nested routes (e.g. /account/orders) highlight the Account tab.
   */
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  /**
   * Intercept navigation to the Account tab.
   * If the user is not authenticated, open the auth modal instead.
   */
  const handleAccountClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal();
    }
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-background border-t border-border/40 shadow-[0_-2px_10px_rgba(0,0,0,0.08)] z-40 md:hidden safe-area-inset-bottom"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-16">
        <NavButton to="/" icon={Home} label="Home" isActive={isActive('/')} />
        <NavButton to="/shop" icon={ShoppingBag} label="Shop" isActive={isActive('/shop')} />
        <NavButton to="/cart" icon={ShoppingCart} label="Cart" badge={totalItems} isActive={isActive('/cart')} />
        <NavButton to="/wishlist" icon={Heart} label="Saved" badge={wishlistCount} isActive={isActive('/wishlist')} />
        <NavButton
          to={isAuthenticated ? '/account' : '/'}
          icon={User}
          label="Account"
          isActive={isActive('/account')}
          onClick={handleAccountClick}
        />
      </div>
    </nav>
  );
}

export default BottomNav;
