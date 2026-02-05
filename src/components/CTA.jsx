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
import { Link } from 'react-router-dom';
import { Wrench, ShoppingCart, MessageCircle } from 'lucide-react';
import { Button } from "./button.jsx"; // Icons for buttons

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
          <Button asChild size="lg" className="bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/book-repair">
              <Wrench className="h-5 w-5 mr-2" />
              Book a Repair
            </Link>
          </Button>

          {/* Shopping button with cart icon */}
          <Button asChild size="lg" className="bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/shop">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Shop Now
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;