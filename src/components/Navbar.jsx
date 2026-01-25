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

import React from 'react';
import { ShoppingCart } from 'lucide-react'; // Icon from Lucide React library
import { Link } from 'react-router-dom'; // For navigation links

const Navbar = () => {
  return (
    // Fixed navigation bar with primary color background and shadow
    <nav className="bg-primary text-primary-foreground shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-8xl mx-auto px-8 sm:px-6 lg:px-8">
        <div className="flex justify-between h-25">
          {/* Logo section on the left */}
          <div className="flex items-center">
            <img src="/TR_Tech_logo.png" alt="TR-Tech Logo" className="h-28 w-auto mr-4" />
          </div>

          {/* Navigation links and cart button on the right */}
          <div className="flex items-center space-x-4">
            {/* Navigation links using React Router Link components */}
            <Link to="/" className="hover:text-accent transition-colors">Home</Link>
            <Link to="/about" className="hover:text-accent transition-colors">About</Link>
            <Link to="/services" className="hover:text-accent transition-colors">Services</Link>
            <Link to="/shop" className="hover:text-accent transition-colors">Shop</Link>
            <Link to="/book-repair" className="hover:text-accent transition-colors">Book Repair</Link>
            <Link to="/contact" className="hover:text-accent transition-colors">Contact</Link>

            {/* Shopping cart button - currently just a visual element */}
            <button type="button" className="p-3 bg-white text-primary hover:bg-gray-100 rounded-md transition-colors">
              <ShoppingCart className="h-5 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;