import React, { useState, useEffect } from 'react';
import { Menu, X, Heart, User, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MiniCart } from './MiniCart';
import { useWishlist } from './WishlistContext';
import { useAuth } from './AuthContext';
import { useAuthModal } from './AuthModalContext';
import { toast } from 'sonner';

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

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const { wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();
  const navigate = useNavigate();

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

  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate('/account');
    } else {
      openAuthModal();
    }
    setAccountDropdownOpen(false);
    setIsOpen(false);
  };

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
            <MiniCart />
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                  className="flex items-center gap-2 bg-white text-primary px-3 py-2 rounded-md hover:bg-gray-200 transition-all"
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
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        My Account
                      </Link>
                      <Link
                        to="/account/orders"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Heart className="h-4 w-4" />
                        Orders
                      </Link>
                      <Link
                        to="/account/repairs"
                        onClick={() => setAccountDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User className="h-4 w-4" />
                        Repairs
                      </Link>
                      <hr className="my-1 border-gray-200" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
                className="bg-white text-primary px-4 py-2 rounded-md font-medium hover:bg-gray-200 hover:shadow-md transition-all"
              >
                Account
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <Link to="/wishlist" className="relative mr-2">
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-primary text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <MiniCart />
            {isAuthenticated && (
              <button
                onClick={handleAccountClick}
                className="p-2 mr-2 bg-white text-primary rounded-md transition-colors"
                aria-label="My Account"
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user?.firstName || 'U').charAt(0)}
                </div>
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-white text-primary hover:bg-gray-300 rounded-md transition-colors ml-1"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              id="mobile-menu"
              className="md:hidden fixed inset-x-0 top-20 bg-primary border-t border-primary-foreground/20 z-50 shadow-xl"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <NavLink to="/" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Home</NavLink>
                <NavLink to="/about" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>About</NavLink>
                <NavLink to="/services" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Services</NavLink>
                <NavLink to="/shop" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Shop</NavLink>
                <NavLink to="/wishlist" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Wishlist</NavLink>
                <NavLink to="/contact" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Contact</NavLink>
                <div className="px-3 py-2">
                  <Link
                    to="/book-repair"
                    className="block w-full text-center bg-white text-primary px-4 py-3 rounded-md font-medium hover:bg-gray-300 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    Book Repair
                  </Link>
                </div>
                {isAuthenticated ? (
                  <>
                    <NavLink to="/account" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>My Account</NavLink>
                    <NavLink to="/account/orders" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Orders</NavLink>
                    <NavLink to="/account/repairs" className="block px-3 py-3 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Repairs</NavLink>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-3 py-3 text-red-400 hover:text-red-300 transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAccountClick}
                    className="block w-full text-left px-3 py-3 hover:text-accent transition-colors"
                  >
                    Account
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
