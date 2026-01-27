import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { toast } from 'sonner';
import { Wrench, CheckCircle, MessageCircle } from 'lucide-react';

export function RepairsPage() {
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

  const deviceTypes = [
    'Smartphone',
    'Laptop',
    'Desktop Computer',
    'Tablet',
    'Other',
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.deviceType || !formData.issue) {
      toast.error('Please fill in all required fields');
      return;
    }

    const message = `
Hi! I'd like to book a repair:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Device Type: ${formData.deviceType}
Brand: ${formData.brand}
Model: ${formData.model}
Issue: ${formData.issue}
Additional Info: ${formData.additionalInfo || 'N/A'}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/27791002552?text=${encodedMessage}`, '_blank');

    toast.success('Redirecting to WhatsApp...');

    // Reset form
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
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="pt-20 md:pt-25">
     {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Wrench className="h-16 w-16 mx-auto mb-6 text-black" />
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Book a Repair</h1>
            <p className="text-xl opacity-90">
              Get your device fixed by our expert technicians
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card text-card-foreground rounded-lg shadow-xl p-8">
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

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  Submit Repair Request via WhatsApp
                </button>

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
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
            What Happens Next?
          </h2>

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
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Why Book With TR-Tech?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="font-bold text-lg mb-2">Expert Technicians</h3>
                <p className="opacity-90 text-sm">
                  Certified professionals with years of experience
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-black" />
                <h3 className="font-bold text-lg mb-2">Quick Turnaround</h3>
                <p className="opacity-90 text-sm">
                  Most repairs completed within 24-48 hours
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-black" />
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
    </div>
  );
}