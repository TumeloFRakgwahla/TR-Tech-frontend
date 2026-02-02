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
import { Link } from 'react-router-dom';
import { Button } from "../components/button.jsx";

const Hero = () => {
  return (
    // Hero section with gradient background, centered content, and responsive padding
    <section id="home" className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20 md:py-44 flex items-center">
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
          <Button asChild size="lg" className="bg-white text-primary border-2 border-white hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/book-repair">Book Repair</Link>
          </Button>

          {/* Secondary action button - outlined style */}
          <Button asChild size="lg" variant="outline" className="bg-white text-primary border-2 border-white hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/shop">Shop Now</Link>
          </Button>

          {/* Tertiary action button - gradient background */}
          <Button asChild size="lg" className="bg-white text-primary border-2 border-white hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;