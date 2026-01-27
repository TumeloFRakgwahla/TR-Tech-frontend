/**
 * Contact Page Component
 *
 * This page provides multiple ways for customers to get in touch with TR-Tech.
 * It includes:
 * - Contact methods (phone, WhatsApp, email) as clickable cards
 * - A contact form that sends messages via WhatsApp
 * - Business hours and location information
 * - Social media links
 * - A prominent WhatsApp chat button in the CTA section
 *
 * The form collects user information and opens WhatsApp with a pre-filled message.
 */

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Phone, Mail, MessageCircle, MapPin, Clock, Facebook, Instagram } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    const message = `
Hi! Contact Form Submission:

Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Subject: ${formData.subject}

Message:
${formData.message}
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/27791002552?text=${encodedMessage}`, '_blank');

    alert('Redirecting to WhatsApp...');

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: 'Call Us',
      details: ['064 510 4733'],
      action: () => window.open('tel:0645104733'),
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      details: ['079 100 2552'],
      action: () => window.open('https://wa.me/27791002552'),
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['trtechrepairsanddesigns', '@gmail.com'],
      action: () => window.open('mailto:trtechrepairsanddesigns@gmail.com'),
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 md:pt-25">

        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
              We're here to help! Reach out to us anytime.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 bg-muted">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-card text-card-foreground p-8 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
                  onClick={method.action}
                >
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <method.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-center">{method.title}</h3>
                  <div className="text-muted-foreground text-center">
                    {method.details.map((detail, idx) => (
                      <p key={idx} className="text-sm">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="max-w-3xl mx-auto">
              <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Fill out the form below and we'll get back to you as soon as possible
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Your name"
                        required
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        placeholder="Your phone number"
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</label>
                      <input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleChange('subject', e.target.value)}
                        placeholder="What's this about?"
                        className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      placeholder="Your message..."
                      rows={6}
                      required
                      className="w-full px-4 py-3 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Send Message via WhatsApp
                  </button>

                  <p className="text-xs text-muted-foreground text-center">
                    You'll be redirected to WhatsApp to send your message
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Business Hours & Location */}
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-primary p-3 rounded-full">
                    <Clock className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-4">Business Hours</h3>
                    <div className="space-y-2 text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Monday - Friday:</span>
                        <span className="font-medium">8:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Saturday:</span>
                        <span className="font-medium">9:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sunday:</span>
                        <span className="font-medium">Closed</span>
                      </div>
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm">
                          * Emergency repairs may be available outside business hours. Contact us for details.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-card text-card-foreground p-8 rounded-lg shadow-md">
                <div className="flex items-start gap-4">
                  <div className="bg-primary p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl mb-4">Follow Us</h3>
                    <p className="text-muted-foreground mb-6">
                      Stay updated with our latest products, services, and special offers on social media.
                    </p>
                    <div className="flex gap-4">
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary p-3 rounded-full hover:scale-110 transition-transform"
                      >
                        <Facebook className="h-6 w-6 text-primary-foreground" />
                      </a>
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-primary p-3 rounded-full hover:scale-110 transition-transform"
                      >
                        <Instagram className="h-6 w-6 text-primary-foreground" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className=" bg-gradient-to-r from-primary to-secondary text-primary-foreground py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prefer to Chat?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Click the WhatsApp button below to start a conversation with us instantly!
            </p>
            <button
              onClick={() => window.open('https://wa.me/27791002552')}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="mr-2 h-5 w-5 inline" />
              Chat on WhatsApp
            </button>
          </div>
        </section>

      </div>
      <Footer />
    </div>
  );
};

export default Contact;