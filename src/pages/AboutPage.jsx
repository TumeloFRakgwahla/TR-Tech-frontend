/**
 * TR-Tech — About Page
 *
 * Brand story and values page structured into four major sections:
 * 1. Hero — gradient header with mission statement
 * 2. Our Story — company history and evolution narrative
 * 3. Our Values — four core principles displayed as icon cards
 * 4. Mission & Vision — side-by-side mission/vision cards
 *
 * Also includes the shared WhyChooseUs component and standard page shell
 * (Navbar, Footer, BottomNav) for consistent UX.
 */

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import WhyChooseUs from '../components/Why-Choose-Us';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 md:pb-0 content-wrapper">

      {/* Hero Section - gradient banner with company tagline */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About TR-Tech
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
             Your trusted partner for tech repairs, graphic design, and quality tech products.
          </p>
        </div>
      </section>

      {/* Our Story - company history and evolution narrative */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From a small repair shop to a comprehensive tech solutions provider.
            </p>
          </div>
          <div className="max-w-7xl mx-auto">
            <p className="text-lg text-muted-foreground mb-6 text-left">
              TR-Tech Repair and Designs was founded with a passion and mission for technology and customer service: to provide exceptional tech and products to
              our community.What started as a small repair shop has grown into a comprehensive tech solutions provider, offering everything from device repairs
              to professional graphic design services.
            </p>

            <p className="text-lg text-muted-foreground mb-6 text-left">
              We understand how essential technology is in today's world. Whether it's your smartphone, laptop, or tablet, these devices keep you connected to
              what matters most. That's why we're dedicated to providing fast, reliable repairs that get your devices back in your hands as quickly as possible.
            </p>

            <p className="text-lg text-muted-foreground mb-6 text-left">
              Beyond repairs, we've expanded our services to include professional graphic design and branding. Our creative team works with businesses and individuals
              to bring their visions to life, creating stunning designs that make an impact.
            </p>

            <p className="text-lg text-muted-foreground text-left">
              We also offer a curated selection of new and pre-owned tech products, giving our customers access to quality devices at competitive prices.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values - four core principles as icon cards with Lucide icons */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Values
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at TR-Tech.
            </p>
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                   <Users size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Customer First</h3>
                <p className="text-muted-foreground">Your satisfaction is our top priority. We listen, we deliver, we exceed expectations.</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                   <Target size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Excellence</h3>
                <p className="text-muted-foreground">We strive for excellence in every repair, design and product we offer. Quality is never compromised.</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                   <Award size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expertise</h3>
                <p className="text-muted-foreground">Our team consists of certified technicians and experienced designers with years of industry knowledge.</p>
              </div>
              <div className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                   <Heart size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">Integrity</h3>
                <p className="text-muted-foreground">Honesty and transparency guide our business. We provide fair pricing and genuine advice.</p>
              </div>
            </div>
        </div>
      </section>

      {/* Mission & Vision - side-by-side cards with company purpose */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-primary">Our Mission</h3>
              <p className="text-muted-foreground">
                To empower our community with reliable tech solutions, innovative designs, and quality products while building lasting relationships based on trust, expertise, and exceptional service.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-4 text-primary">Our Vision</h3>
              <p className="text-muted-foreground">
                To be the leading technology solutions provider in South Africa, known for our expertise, reliability, and commitment to customer success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shared Why Choose Us component - competitive advantages */}
      <WhyChooseUs />

      <Footer />
      <BottomNav />
      </div>
    </div>
  );
};

export default About;
