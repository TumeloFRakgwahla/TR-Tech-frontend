/**
 * Hero Section Component
 *
 * This is the main banner section that appears at the top of the homepage.
 * It features a large heading, descriptive text, and call-to-action buttons
 * that encourage users to engage with the website's main services.
 *
 * The section uses a gradient background and responsive design to look great
 * on all screen sizes. The buttons have hover animations for better user experience.
 */

import React from 'react';

const Hero = () => {
  return (
    // Hero section with gradient background, centered content, and large padding
    <section id="home" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-44 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        {/* Main headline */}
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Your trusted tech solution partner
        </h1>

        {/* Descriptive paragraph */}
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          Expert repair services for all your electronic devices and custom design solutions
          for your technology needs.
        </p>

        {/* Call-to-action buttons arranged in a responsive flex layout */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Primary action button - white background */}
          <button className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 border-2 border-white hover:border-primary">
            Book Repair
          </button>

          {/* Secondary action button - outlined style */}
          <button className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-110 hover:-translate-y-1">
            Shop Now
          </button>

          {/* Tertiary action button - gradient background */}
          <button className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-110 hover:-translate-y-1 transition-all duration-300 hover:from-accent/90 hover:to-accent/60">
            Contact Us
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;