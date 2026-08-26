import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';

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
      <span className={`text-[10px] mt-0.5 leading-tight ${isActive ? 'font-semibold' : 'font-medium'}`}>
        {label}
      </span>
    </Link>
  );
};

export function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleAccountClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      openAuthModal();
    }
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border z-40 md:hidden safe-area-inset-bottom"
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
