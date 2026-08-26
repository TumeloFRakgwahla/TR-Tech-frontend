import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from './CartContext';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';

const NavButton = ({ to, icon: Icon, label, badge, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center flex-1 min-h-[56px] py-1.5 transition-colors ${
        isActive ? 'text-primary' : 'text-muted-foreground'
      }`}
      aria-label={label}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="relative">
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
        {badge > 0 && (
          <span className="absolute -top-1.5 -right-2.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
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
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-background border-t border-border z-40 md:hidden"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around items-center h-16 pb-safe">
        <NavButton to="/" icon={Home} label="Home" />
        <NavButton to="/shop" icon={ShoppingBag} label="Shop" />
        <NavButton to="/cart" icon={ShoppingCart} label="Cart" badge={totalItems} />
        <NavButton to="/wishlist" icon={Heart} label="Saved" badge={wishlistCount} />
        <NavButton
          to={isAuthenticated ? '/account' : '/'}
          icon={User}
          label="Account"
          onClick={!isAuthenticated ? (e) => {
            e.preventDefault();
            document.dispatchEvent(new CustomEvent('open-auth-modal'));
          } : undefined}
        />
      </div>
    </nav>
  );
}

export default BottomNav;
