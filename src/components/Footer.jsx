/**
 * Footer Component
 *
 * The website footer that appears at the bottom of every page. It contains
 * company information, navigation links, services list, contact details,
 * and social media links. Also includes copyright information.
 *
 * Uses a custom TikTok icon component since it's not available in Lucide.
 */

import React from 'react';
import { Facebook, Instagram, Phone, Mail, MessageCircle } from 'lucide-react';

// Custom TikTok icon component using SVG
const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8 md:py-12 pb-20 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">TR-Tech Repairs & Designs</h3>
            <p className="text-primary-foreground/80">
              Professional tech repairs and innovative graphic design, and quality tech products.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-1">
              <li><a href="/about" className="block py-3 text-primary-foreground/80 hover:text-accent transition-colors min-h-[44px] flex items-center">About Us</a></li>
              <li><a href="/services" className="block py-3 text-primary-foreground/80 hover:text-accent transition-colors min-h-[44px] flex items-center">Our Services</a></li>
              <li><a href="/shop" className="block py-3 text-primary-foreground/80 hover:text-accent transition-colors min-h-[44px] flex items-center">Shop Product</a></li>
              <li><a href="/book-repair" className="block py-3 text-primary-foreground/80 hover:text-accent transition-colors min-h-[44px] flex items-center">Book a Repair</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Our Services</h4>
            <ul className="space-y-1 text-primary-foreground/80">
              <li className="py-3 min-h-[44px] flex items-center">Phone Repairs</li>
              <li className="py-3 min-h-[44px] flex items-center">Laptop & Computer Repairs</li>
              <li className="py-3 min-h-[44px] flex items-center">Software Solutions</li>
              <li className="py-3 min-h-[44px] flex items-center">Graphic Design</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact & Social</h4>
            <ul className="space-y-1 text-primary-foreground/80">
              <li className="flex items-center gap-2 py-2 min-h-[44px]"><Phone className="h-4 w-4 flex-shrink-0" /> <span>Call: 064 518 4733</span></li>
              <li className="flex items-center gap-2 py-2 min-h-[44px]"><MessageCircle className="h-4 w-4 flex-shrink-0" /> <span>Whatsapp: 079 100 2552</span></li>
              <li className="flex items-center gap-2 py-2 min-h-[44px]"><Mail className="h-4 w-4 flex-shrink-0" /> <span className="truncate">trtechrepairsanddesigns@gmail.com</span></li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center" aria-label="TikTok">
                <TikTokIcon />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-primary-foreground/80">
            © 2024 TR-Tech Repairs & Designs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
