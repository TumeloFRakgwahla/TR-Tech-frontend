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
import Seo from '../components/Seo';
import { Users, Target, Award, Heart } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Seo
        title="About Us"
        description="TR-Tech Repairs and Designs was founded with a passion for technology and customer service. We offer expert tech repairs, graphic design, and quality tech products in South Africa."
      />
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
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Story
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From a small repair shop to a comprehensive tech solutions provider.
            </p>
          </div>
          <div className="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
            <div className="space-y-6">
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
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Mission</h2>
              <p className="text-muted-foreground">
                To empower our community with reliable tech solutions, innovative designs, and quality products while building lasting relationships based on trust, expertise, and exceptional service.
              </p>
            </div>
            <div className="bg-card p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-primary">Our Vision</h2>
              <p className="text-muted-foreground">
                To be the leading technology solutions provider in South Africa, known for our expertise, reliability, and commitment to customer success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Shipping Information */}
      <section id="shipping" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Shipping Information</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Fast, reliable delivery across South Africa</p>
          </div>
          <div className="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Delivery Areas</h3>
                <p className="text-muted-foreground">We deliver nationwide across South Africa. Delivery times vary by location:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2 space-y-1">
                  <li>Major cities (Johannesburg, Cape Town, Durban, Pretoria): 1-3 business days</li>
                  <li>Regional areas: 3-5 business days</li>
                  <li>Remote areas: 5-7 business days</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Shipping Costs</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Free delivery on all orders over R500</li>
                  <li>Standard delivery (under R500): R50</li>
                  <li>Express delivery: R100 (1-2 business days)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Order Processing</h3>
                <p className="text-muted-foreground">Orders are processed within 24 hours on business days. You will receive a confirmation message via WhatsApp or email once your order is dispatched.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Returns Policy */}
      <section id="returns" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Returns Policy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Hassle-free returns within 30 days</p>
          </div>
          <div className="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">30-Day Return Window</h3>
                <p className="text-muted-foreground">We offer a 30-day return policy for all products. If you are not satisfied with your purchase, you may return it within 30 days of delivery for a full refund or exchange.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Return Conditions</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Items must be in original condition with all accessories and packaging</li>
                  <li>Products must not be damaged, modified, or show signs of misuse</li>
                  <li>Custom orders and services are non-returnable once work has commenced</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">How to Return</h3>
                <p className="text-muted-foreground">Contact us via WhatsApp or email to initiate a return. We will provide you with return instructions and a prepaid shipping label where applicable. Refunds are processed within 7-10 business days after we receive the returned item.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Policy */}
      <section id="privacy" className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Privacy Policy</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Your privacy is important to us</p>
          </div>
          <div className="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Information We Collect</h3>
                <p className="text-muted-foreground">We collect personal information such as your name, phone number, email address, and delivery address when you place an order, book a repair, or contact us. This information is used solely to fulfill your requests and provide customer support.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">How We Use Your Information</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>To process and deliver your orders</li>
                  <li>To communicate about repairs and services</li>
                  <li>To improve our products and services</li>
                  <li>To send promotional offers (only with your consent)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Data Security</h3>
                <p className="text-muted-foreground">We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your data is stored securely and is never sold to third parties.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Your Rights</h3>
                <p className="text-muted-foreground">You have the right to access, correct, or delete your personal information at any time. Contact us if you wish to exercise these rights.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Terms of Service */}
      <section id="terms" className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Terms of Service</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Please review our terms and conditions</p>
          </div>
          <div className="max-w-4xl mx-auto bg-card text-card-foreground rounded-lg shadow-md p-6 md:p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">General Terms</h3>
                <p className="text-muted-foreground">By using our website and services, you agree to these terms. We reserve the right to update these terms at any time. Continued use of our services constitutes acceptance of any changes.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Orders and Payments</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>All orders are subject to product availability</li>
                  <li>Prices are subject to change without notice</li>
                  <li>Payment is due upon order confirmation</li>
                  <li>We accept cash, card, bank transfer, and other methods as indicated at checkout</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Repairs and Services</h3>
                <p className="text-muted-foreground">All repairs are performed by qualified technicians. We guarantee our work for the duration specified at the time of service. We are not liable for data loss; please back up your devices before repair.</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-primary">Limitation of Liability</h3>
                <p className="text-muted-foreground">TR-Tech Repairs and Designs shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase price of the product or service.</p>
              </div>
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
