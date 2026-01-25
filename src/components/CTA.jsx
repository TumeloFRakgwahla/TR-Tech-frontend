/**
 * Call-to-Action Section Component
 *
 * This component displays a section with a compelling message and action buttons
 * to encourage visitors to take the next step. It typically appears at the end
 * of pages to convert visitors into customers.
 *
 * Features two main action buttons with icons for booking repairs and shopping.
 */

import React from 'react';
import { Wrench, ShoppingCart, MessageCircle } from 'lucide-react'; // Icons for buttons

const CTA = () => {
  return (
    // Section with gradient background and centered content
    <section id="cta" className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Section heading */}
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>

        {/* Descriptive text */}
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Whether you need a repair, a custom design, or new tech products, we're here to help
        </p>

        {/* Action buttons in responsive layout */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Repair booking button with wrench icon */}
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white hover:border-primary flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Book a Repair
          </button>

          {/* Shopping button with cart icon */}
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white hover:border-primary flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;