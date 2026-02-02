/**
 * Navigation Bar Component
 *
 * This component creates the main navigation bar that appears at the top of every page.
 * It includes the company logo, navigation links to different sections of the website,
 * and a shopping cart button. The navbar is fixed at the top of the screen and stays
 * visible while scrolling.
 *
 * Uses React Router's Link component for client-side navigation without page reloads.
 */

import React, { useState } from 'react';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CartDrawer } from './CartDrawer';
import { useCart } from './CartContext';

const CartButton = () => {
  const { totalItems } = useCart();
  
  return (
    <CartDrawer>
      <button type="button" className="p-2 sm:p-3 bg-white text-primary hover:bg-gray-100 rounded-md transition-colors relative touch-manipulation">
        <ShoppingCart className="h-5 w-5 sm:h-6" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    </CartDrawer>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // Fixed navigation bar with primary color background and shadow
    <nav className="bg-primary text-primary-foreground shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 md:h-25">
          {/* Logo section on the left */}
          <div className="flex items-center">
            <img src="/TR_Tech_logo.png" alt="TR-Tech Logo" className="h-16 md:h-28 w-auto mr-2 md:mr-4" />
          </div>

          {/* Desktop Navigation links and cart button */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Navigation links using React Router Link components */}
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
            <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
            <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <Link to="/book-repair" className="hover:text-accent transition-colors">Book Repair</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>

            {/* Shopping cart button */}
            <CartButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {/* Mobile cart button */}
            <CartButton />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 bg-white text-primary hover:bg-gray-100 rounded-md transition-colors ml-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-primary border-t border-primary-foreground/20">
              <Link to="/" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Home</Link>
              <Link to="/about" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>About</Link>
              <Link to="/services" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Services</Link>
              <Link to="/shop" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Shop</Link>
              <Link to="/book-repair" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Book Repair</Link>
              <Link to="/contact" className="block px-3 py-2 hover:text-accent transition-colors" onClick={() => setIsOpen(false)}>Contact</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
