/**
 * TR-Tech — Book a Repair Page
 *
 * Two-section page for submitting repair requests:
 * 1. Hero — repair booking intro with icon and headline
 * 2. Booking Form — multi-field form capturing customer info, device details,
 *    and issue description. On successful submission, the request is saved
 *    via the backend API and the user is redirected to WhatsApp with a
 *    pre-filled message containing the repair ID and issue summary.
 * 3. What Happens Next — 4-step process visualization
 * 4. Why Book With TR-Tech — trust section highlighting expertise and warranty
 *
 * Form validation:
 * - Required: name, phone, device type, issue description
 * - Optional: email, brand, model, additional info
 *
 * After submission:
 * - API stores the repair request
 * - WhatsApp opens with a pre-filled message for immediate follow-up
 * - Form resets on success
 */

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import Seo from '../components/Seo';
import { toast } from 'sonner';
import { Wrench, CheckCircle } from 'lucide-react';
import { Button } from "../components/button.jsx";
import { repairsAPI } from '../services/api';
import { createWhatsAppUrl, sanitizeWhatsAppInput } from '../lib/sanitize';
import { WHATSAPP_NUMBER } from '../constants';

export function RepairsPage() {
  // Form state: captures customer info, device details, and issue description
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deviceType: '',
    brand: '',
    model: '',
    issue: '',
    additionalInfo: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  // Device type options for the select dropdown
  const deviceTypes = [
    'Smartphone',
    'Laptop',
    'Desktop Computer',
    'Tablet',
    'Other',
  ];

  // Generic field change handler using key/value pattern
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Form submission: validates required fields, submits to API, opens WhatsApp
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation for required fields
    if (!formData.name || !formData.phone || !formData.deviceType || !formData.issue) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      // Submit to backend API first
      const response = await repairsAPI.create({
        customer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
        device: {
          type: formData.deviceType,
          brand: formData.brand,
          model: formData.model,
        },
        issue: formData.issue,
        additionalInfo: formData.additionalInfo,
      });

      if (response.success) {
        // Open WhatsApp with pre-filled message including repair ID for reference
        const repairId = response.data?._id;
        const message = `Hi! I've just submitted a repair request${repairId ? ` (ID: ${repairId})` : ''}. ${sanitizeWhatsAppInput(formData.issue)}`;
        window.open(createWhatsAppUrl(message, WHATSAPP_NUMBER), '_blank');

        toast.success('Repair request submitted successfully!');
        
        // Reset form only on success
        setFormData({
          name: '',
          email: '',
          phone: '',
          deviceType: '',
          brand: '',
          model: '',
          issue: '',
          additionalInfo: '',
        });
      } else {
        toast.error(response.message || 'Failed to submit repair request. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting repair request:', err);
      toast.error('Failed to submit repair request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <Seo
        title="Book a Repair"
        description="Book professional tech repair services at TR-Tech. Smartphones, laptops, tablets — fast, reliable repairs with a warranty."
      />

      <div className="pt-20 md:pb-0 content-wrapper">
      {/* Hero Section */}
       <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <div className="max-w-3xl mx-auto">
             <Wrench className="h-16 w-16 mx-auto mb-6 text-white" />
             <h1 className="text-4xl md:text-5xl font-bold mb-6">Book a Repair</h1>
             <p className="text-xl opacity-90">
               Get your device fixed by our expert technicians
             </p>
           </div>
         </div>
       </section>

       {/* Booking Form */}
       <section className="py-16 bg-background">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="max-w-3xl mx-auto">
             <div className="bg-card text-card-foreground rounded-lg shadow-xl p-6 md:p-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Repair Request Form</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Fill in the details below and we'll get back to you shortly
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-foreground font-medium mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-foreground font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="064 510 4733"
                      className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-foreground font-medium mb-2">Email Address</label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                {/* Device Information */}
                <div className="pt-4 border-t border-border">
                  <h3 className="font-bold text-lg mb-4 text-foreground">Device Information</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="deviceType" className="block text-foreground font-medium mb-2">
                        Device Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="deviceType"
                        value={formData.deviceType}
                        onChange={(e) => handleChange('deviceType', e.target.value)}
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                        required
                      >
                        <option value="">Select device</option>
                        {deviceTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="brand" className="block text-foreground font-medium mb-2">Brand</label>
                      <input
                        id="brand"
                        type="text"
                        value={formData.brand}
                        onChange={(e) => handleChange('brand', e.target.value)}
                        placeholder="e.g., Apple, Samsung"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label htmlFor="model" className="block text-foreground font-medium mb-2">Model</label>
                      <input
                        id="model"
                        type="text"
                        value={formData.model}
                        onChange={(e) => handleChange('model', e.target.value)}
                        placeholder="e.g., iPhone 14, Galaxy S23"
                        className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {/* Problem Description */}
                <div>
                  <label htmlFor="issue" className="block text-foreground font-medium mb-2">
                    Problem Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="issue"
                    value={formData.issue}
                    onChange={(e) => handleChange('issue', e.target.value)}
                    placeholder="Please describe the issue with your device..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="additionalInfo" className="block text-foreground font-medium mb-2">
                    Additional Information
                  </label>
                  <textarea
                    id="additionalInfo"
                    value={formData.additionalInfo}
                    onChange={(e) => handleChange('additionalInfo', e.target.value)}
                    placeholder="Any other details we should know..."
                    rows={3}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="w-full whitespace-normal px-4 py-3 text-sm leading-tight md:text-base md:whitespace-nowrap md:px-8 md:leading-normal bg-white text-primary border-2 border-black hover:bg-primary hover:text-white hover:border-primary font-bold shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  {isLoading ? 'Submitting...' : 'Submit Repair Request via WhatsApp'}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting this form, you'll be redirected to WhatsApp to complete your booking
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens Next */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">
              What Happens Next?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our simple, transparent process from start to finish.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                1
              </div>
              <h3 className="font-bold mb-2 text-foreground">Submit Request</h3>
              <p className="text-sm text-muted-foreground">
                Fill out the form and send via WhatsApp
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                2
              </div>
              <h3 className="font-bold mb-2 text-foreground">We Contact You</h3>
              <p className="text-sm text-muted-foreground">
                Our team reaches out to confirm details
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                3
              </div>
              <h3 className="font-bold mb-2 text-foreground">Drop Off Device</h3>
              <p className="text-sm text-muted-foreground">
                Bring your device to our shop
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground text-2xl font-bold">
                4
              </div>
              <h3 className="font-bold mb-2 text-foreground">Get It Fixed</h3>
              <p className="text-sm text-muted-foreground">
                We repair and notify you when ready
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Book With Us */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Book With TR-Tech?</h2>
              <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
                Experience the TR-Tech difference with every repair.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2">Expert Technicians</h3>
                <p className="opacity-90 text-sm">
                  Certified professionals with years of experience
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2">Quick Turnaround</h3>
                <p className="opacity-90 text-sm">
                  Most repairs completed within 24-48 hours
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-white" />
                <h3 className="font-bold text-lg mb-2">Warranty Included</h3>
                <p className="opacity-90 text-sm">
                  All repairs backed by our quality guarantee
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>   
      </div>
      
      <Footer />
      <BottomNav />
    </div>
  );
}
