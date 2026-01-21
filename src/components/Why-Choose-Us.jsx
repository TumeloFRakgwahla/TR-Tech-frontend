import React from 'react';
import { Shield, Clock, Users, DollarSign } from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      title: 'Quality Guaranteed',
      description: 'All repairs come with warranty',
      icon: Shield
    },
    {
      title: 'Fast Service',
      description: 'Quick turnaround times',
      icon: Clock
    },
    {
      title: 'Expert Technicians',
      description: 'Certified professionals',
      icon: Users
    },
    {
      title: 'Competitive Pricing',
      description: 'Affordable rates without compromising quality',
      icon: DollarSign
    }
  ];

  return (
    <section id="why-choose-us" className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose TR-Tech?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're committed to providing excellent service and building lasting relationships.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="bg-card text-card-foreground p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 mx-auto">
                <reason.icon className="text-2xl" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;