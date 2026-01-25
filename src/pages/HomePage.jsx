/**
 * Home Page Component
 *
 * This is the main landing page of the TR-Tech website. It combines all the
 * major sections of the homepage into a single page layout. Each section
 * is a separate reusable component that can be maintained independently.
 *
 * The page structure follows a typical business website layout:
 * - Navigation bar (fixed at top)
 * - Hero section (main banner)
 * - Services section (what we offer)
 * - Why Choose Us section (our advantages)
 * - Call-to-Action section (encourage engagement)
 * - Footer (contact info and links)
 */

import React from 'react';
import Navbar from '../components/Navbar';          // Navigation bar component
import Hero from '../components/Hero';              // Main banner section
import Services from '../components/Services';      // Services we offer
import WhyChooseUs from '../components/Why-Choose-Us'; // Why choose our company
import CTA from '../components/CTA';                // Call-to-action section
import Footer from '../components/Footer';          // Footer with contact info

const Home = () => {
  return (
    // Main container with minimum full screen height
    <div className="min-h-screen">
      {/* Fixed navigation bar at the top */}
      <Navbar />

      {/* Hero section - main banner with call-to-action */}
      <Hero />

      {/* Services section - showcase what we offer */}
      <Services />

      {/* Why Choose Us section - highlight our advantages */}
      <WhyChooseUs />

      {/* Call-to-Action section - encourage user engagement */}
      <CTA />

      {/* Footer with contact information and links */}
      <Footer />
    </div>
  );
};

export default Home;