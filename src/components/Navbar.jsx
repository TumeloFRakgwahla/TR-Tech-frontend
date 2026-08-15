import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MiniCart } from './MiniCart';

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
            <MiniCart />
          </div>

          <div className="md:hidden flex items-center">
            <MiniCart />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-white text-primary hover:bg-gray-300 rounded-md transition-colors ml-2"
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
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
