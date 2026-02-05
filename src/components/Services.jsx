import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Code, Palette, Wrench, ShoppingCart, Phone } from 'lucide-react';
import { Button } from "./button.jsx";

const Services = () => {
  const services = [
    {
      title: 'Phone Repairs',
      description: 'Expert repair services for smartphones brands.',
      icon: Smartphone
    },
    {
      title: 'Laptop & Computer',
      description: 'Fast and reliable computer repairs.',
      icon: Laptop
    },
    {
      title: 'Software Solutions',
      description: 'Troubleshooting and optimization.',
      icon: Code
    },
    {
      title: 'Graphic Design',
      description: 'Professional graphic design branding',
      icon: Palette
    }
  ];

  return (
    <section id="services" className="py-16 bg-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Services
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide comprehensive technology solutions to meet all your digital needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <service.icon className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-muted-foreground mb-4">{service.description}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
          <Button asChild size="lg" className="bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;