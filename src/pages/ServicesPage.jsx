import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Wrench, ShoppingCart, Smartphone, Laptop, Code, Palette, Settings, CheckCircle } from 'lucide-react';
import { Button } from "../components/ui/button";
import { servicesAPI } from '../services/api';

const iconMap = {
  Smartphone,
  Laptop,
  Code,
  Palette,
  Settings,
  Wrench,
};

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getAll();
        if (!controller.signal.aborted) {
          if (response.success) {
            setServices(response.data);
            setError(null);
          } else {
            setError(response.message);
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError('Failed to load services');
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    fetchServices();
    return () => controller.abort();
  }, []);

  const process = [
    { step: '1', title: 'Book', description: 'Schedule your repair online or visit us' },
    { step: '2', title: 'Diagnosis', description: 'We assess the issue and provide a quote' },
    { step: '3', title: 'Repair', description: 'Our experts fix your device quickly and efficiently' },
    { step: '4', title: 'Collect', description: 'Pick up your device, good as new' }
  ];

  if (!services || services.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="pt-20 md:pt-25 flex items-center justify-center min-h-[50vh]">
          <p className="text-slate-400">No services available</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="pt-20 md:pt-25">

        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Services</h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              Comprehensive tech solutions and creative services tailored to your needs
            </p>
          </div>
        </section>

        <section className="py-16 bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                What We Offer
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Professional services delivered with expertise, speed, and guaranteed satisfaction.
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {services.map((service, index) => {
                  const IconComponent = iconMap[service.icon] || Wrench;
                  return (
                    <div key={service._id || index} className="bg-slate-800 text-white p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
                      <div className="flex items-start mb-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl md:text-2xl font-semibold">{service.title || service.name}</h3>
                          <p className="text-blue-400 font-medium">{service.price || 'Quote based'}</p>
                        </div>
                      </div>
                      <p className="text-slate-300 mb-4 flex-grow">{service.description}</p>
                      <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-white">What's Included:</h4>
                        <ul className="space-y-2">
                          {(service.features || []).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-slate-300">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-auto">
                        <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                          <Link to="/book-repair">Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Our Process
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Simple, transparent process from start to finish.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {process.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold text-white">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{step.title}</h3>
                  <p className="text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Your Device Fixed?</h2>
              <p className="text-lg max-w-2xl mx-auto">
                Book your repair today and get your device to perfect working condition
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button asChild size="lg" className="bg-white text-blue-600 border-2 border-white hover:bg-blue-600 hover:text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <Link to="/book-repair">
                  <Wrench className="h-5 w-5 mr-2" />
                  Book a Repair
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-blue-600 border-2 border-white hover:bg-blue-600 hover:text-white font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <Link to="/shop">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
}