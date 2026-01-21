import React from 'react';
import { Wrench, ShoppingCart, MessageCircle } from 'lucide-react';

const CTA = () => {
  return (
    <section id="cta" className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Whether you need a repair, a custom design, or new tech products, we'er here to help
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-white hover:border-primary flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Book a Repair
          </button>
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