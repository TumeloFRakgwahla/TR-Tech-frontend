import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Services from '../components/Services';
import WhyChooseUs from '../components/Why-Choose-Us';
import CTA from '../components/CTA';
import Footer from '../components/Footer';
const Home = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Services />
      <WhyChooseUs />
      <CTA />
      <Footer />
    </div>
  );
};

export default Home;