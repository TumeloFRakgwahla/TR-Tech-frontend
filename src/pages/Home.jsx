import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 z-10">
        <Navbar />
      </div>
      <Hero />
    </div>
  );
};

export default Home;