import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {Wrench, ShoppingCart, Smartphone, Laptop, Code, Palette, Settings, CheckCircle, Clock, Shield, Star } from 'lucide-react';

const Services = () => {
  const services = [
    {
      title: 'Phone Repairs',
      icon: Smartphone,
      description: 'Expert repair services for all smartphone brands including screen replacement, battery replacement, charging port repairs, and software issues.',
      features: ['Screen replacement', 'Battery replacement', 'Charging port repair', 'Software troubleshooting', 'Water damage repair'],
      price: 'From R150'
    },
    {
      title: 'Laptop & Computer Repairs',
      icon: Laptop,
      description: 'Comprehensive laptop and desktop repair services including hardware upgrades, virus removal, data recovery, and performance optimization.',
      features: ['Hardware diagnostics', 'Virus removal', 'Data recovery', 'Performance optimization', 'Hardware upgrades'],
      price: 'From R200'
    },
    {
      title: 'Software Solutions',
      icon: Code,
      description: 'Custom software development, website creation, app development, and IT consulting services tailored to your business needs.',
      features: ['Custom software development', 'Website design', 'Mobile app development', 'IT consulting', 'System integration'],
      price: 'Quote based'
    },
    {
      title: 'Graphic Design',
      icon: Palette,
      description: 'Professional graphic design services including logo design, branding, marketing materials, and digital artwork creation.',
      features: ['Logo design', 'Brand identity', 'Marketing materials', 'Social media graphics', 'Print design'],
      price: 'From R300'
    },
    {
      title: 'Software Troubleshooting',
      icon: Settings,
      description: 'Expert software troubleshooting and optimization services for operating systems, applications, and system performance issues.',
      features: ['OS optimization', 'Virus/malware removal', 'Driver updates', 'Software installation', 'Performance tuning'],
      price: 'From R100'
    }
  ];

  const process = [
    {
      step: '1',
      title: 'Book',
      description: 'Schedule your repair online or visit us'
    },
    {
      step: '2',
      title: 'Diagnosis',
      description: 'We assess the issue and provide a quote'
    },
    {
      step: '3',
      title: 'Repair',
      description: 'Our experts fix your device quickly and efficiently'
    },
    {
      step: '4',
      title: 'Collect',
      description: 'Pick up your device, good as new'
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-28">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Our Services
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Comprehensive tech solutions and creative services tailored to your needs
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional services delivered with expertise, speed, and guaranteed satisfaction.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-card text-card-foreground p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-4">
                      <service.icon className="text-xl" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-semibold">{service.title}</h3>
                      <p className="text-primary font-medium">{service.price}</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground mb-6">{service.description}</p>

                  <div className="mb-6">
                    <h4 className="font-semibold mb-3">What's Included:</h4>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                    Get Started
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Process
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Simple, transparent process from start to finish.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Our Services */}
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold  mb-4">
                Ready to Get Your Device Fixed?
              </h2>
              <p className="text-lg  max-w-2xl mx-auto">
                Book your repair today and get your device to perfect working condition
              </p>
            </div>
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

      </div>
      <Footer />
    </div>
  );
};

export default Services;