import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhyChooseUs from '../components/Why-Choose-Us';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            About TR-Tech
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Your trusted partner for tech repairs. graphic desgin, and quality tech products.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Story
            </h2>
          </div>
          <div className="max-w-6xl mx-auto">
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

      {/* Our Values */}
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
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <Users className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer First</h3>
              <p className="text-muted-foreground">Your satisfaction is our top priority. We listen, we deliver, we exceed expectations.</p>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <Target className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-muted-foreground">We strive for excellence in every repair, design and product we offer. Quality is never compromised.</p>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <Award className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Expertise</h3>
              <p className="text-muted-foreground">Our team consists of certified technicians and experienced designers with years of industry knowledge.</p>
            </div>
            <div className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <Heart className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integrity</h3>
              <p className="text-muted-foreground">Honesty and transpareny guide our business. We provide fair pricing and genuines advice.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
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

      {/* Why Choose Us */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose TR-Tech?</h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-3">✓ Certified Technicians</h3>
              <p className="text-gray-200">
                All our technicians are certified and continuously trained on the latest technologies and repair techniques.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-3">✓ Quality Parts</h3>
              <p className="text-gray-200">
                We use only genuine or high-quality replacement parts to ensure your device performs like new.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-3">✓ Warranty Coverage</h3>
              <p className="text-gray-200">
                All repairs come with a warranty, giving you peace of mind and confidence in our work.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <h3 className="font-bold text-xl mb-3">✓ Transparent Pricing</h3>
              <p className="text-gray-200">
                No hidden fees or surprises. We provide clear, upfront pricing before any work begins.
              </p>
            </div>
          </div>
        </div>
      </section>
      </div>

      <Footer />
    </div>
  );
};

export default About;
