import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import {Wrench, ShoppingCart, Smartphone, Laptop, Code, Palette, Settings, CheckCircle } from 'lucide-react';
import { Button } from "../components/button.jsx";
import { servicesAPI } from '../services/api';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Icon mapping
  const iconMap = {
    Smartphone,
    Laptop,
    Code,
    Palette,
    Settings,
    Wrench,
  };

  // Fetch services from API
  useEffect(() => {
    const controller = new AbortController();
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await servicesAPI.getAll({}, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (response.success) {
          setServices(response.data || []);
          setError(null);
        } else {
          setError(response.message || 'Failed to load services');
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error fetching services:', err);
        setError('Failed to load services');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchServices();
    return () => controller.abort();
  }, []);

  const displayServices = services;

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
      <div className="pt-20 md:pb-0 content-wrapper">

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
              {loading ? (
                <div className="col-span-full text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading services...</p>
                </div>
              ) : error ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-red-500 mb-4">{error}</p>
                </div>
              ) : displayServices.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No services found</p>
                </div>
              ) : (
                 displayServices.map((service, index) => {
                   const IconComponent = iconMap[service.icon] || Wrench;
                   const priceDisplay = service.price === 0 ? 'Quote based' : `From R${Number(service.price).toLocaleString()}`;
                   return (
                     <div key={service._id || service.name || index} className="bg-card text-card-foreground p-6 md:p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
                       {/* Header with Icon and Title */}
                       <div className="flex items-start mb-4">
                         <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                            <IconComponent size={20} />
                         </div>
                         <div>
                           <h3 className="text-xl md:text-2xl font-semibold">{service.name}</h3>
                           <p className="text-primary font-medium">{priceDisplay}</p>
                         </div>
                       </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-4 flex-grow-0">{service.description}</p>

                      {/* Features List */}
                      <div className="mb-6 flex-grow-0">
                        <h4 className="font-semibold mb-3">What's Included:</h4>
                        <ul className="space-y-2">
                          {(service.features || []).map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Button at bottom */}
                      <div className="mt-auto">
                        <Button asChild size="lg" className="w-full bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                          <Link to="/book-repair">
                            Book Now
                          </Link>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
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
              <Button asChild size="lg" className="bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <Link to="/book-repair">
                  <Wrench className="h-5 w-5" />
                  Book a Repair
                </Link>
              </Button>
              <Button asChild size="lg" className="bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold text-lg shadow-lg hover:shadow-2xl transition-all duration-300">
                <Link to="/shop">
                  <ShoppingCart className="h-5 w-5" />
                  Shop Now
                </Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Services;
