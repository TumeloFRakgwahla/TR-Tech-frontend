import React from 'react';
import { ShoppingCart } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-primary text-primary-foreground shadow-lg">
      <div className="max-w-8xl mx-auto px-8 sm:px-6 lg:px-8">
        <div className="flex justify-between h-25">
          <div className="flex items-center">
            <img src="/TR_Tech_logo.png" alt="TR-Tech Logo" className="h-28 w-auto mr-4" />
          </div>
          <div className="flex items-center space-x-4">
            <a href="#home" className="hover:text-accent transition-colors">Home</a>
            <a href="#services" className="hover:text-accent transition-colors">About</a>
            <a href="#contact" className="hover:text-accent transition-colors">Services</a>
            <a href="#shop" className="hover:text-accent transition-colors">Shop</a>
            <a href="#book-repair" className="hover:text-accent transition-colors">Book Repair</a>
            <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
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