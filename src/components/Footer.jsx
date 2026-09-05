/**
 * TR-Tech — Site Footer
 *
 * Comprehensive e-commerce footer with:
 * - Brand logo and company description
 * - Social media links (Facebook, Instagram, TikTok)
 * - Dynamic shop category links fetched from the backend
 * - Static navigation columns: Shop, Company, Help & Support
 * - Newsletter signup form that redirects to WhatsApp
 * - Payment method badges (Visa, Mastercard, PayFast, Ozow)
 * - Copyright notice with dynamic year
 *
 * The shop categories are fetched on mount and refreshed when admin
 * data changes via the `admin-data-changed` custom event.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Mail,
  Send,
} from 'lucide-react';
import { WHATSAPP_BASE_URL } from '../constants';
import { categoriesAPI } from '../services/api';

const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const footerNav = {
  shop: [
    { label: 'All Products', href: '/shop' },
    { label: 'Smartphones', href: '/shop?category=Smartphones' },
    { label: 'Laptops', href: '/shop?category=Laptops' },
    { label: 'Gaming', href: '/shop?category=Gaming' },
    { label: 'Printers', href: '/shop?category=Printers' },
    { label: 'Storage Devices', href: '/shop?category=Storage%20Devices' },
  ],
  company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Services', href: '/services' },
    { label: 'Book a Repair', href: '/book-repair' },
    { label: 'Contact', href: '/contact' },
  ],
  help: [
    { label: 'My Account', href: '/account' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Cart', href: '/cart' },
    { label: 'Shipping Info', href: '/about#shipping' },
    { label: 'Returns Policy', href: '/about#returns' },
    { label: 'Privacy Policy', href: '/about#privacy' },
    { label: 'Terms of Service', href: '/about#terms' },
  ],
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [shopCategories, setShopCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoriesAPI.getActive();
        if (res.success && res.data && res.data.length > 0) {
          setShopCategories(res.data);
        }
      } catch {
        // keep empty — footer shop links degrade gracefully
      }
    };
    fetchCategories();

    const handler = (e) => {
      if (e.detail?.type === 'categories') {
        fetchCategories();
      }
    };
    window.addEventListener('admin-data-changed', handler);
    return () => window.removeEventListener('admin-data-changed', handler);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    const message = encodeURIComponent(`Newsletter subscription for ${email}`);
    window.open(`${WHATSAPP_BASE_URL}?text=${message}`, '_blank');
    setIsSubscribed(true);
    setEmail('');
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const year = new Date().getFullYear();

  const shopLinks = shopCategories.length > 0
    ? shopCategories.map(c => ({
        label: c.name,
        href: `/shop?category=${encodeURIComponent(c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))}`,
      }))
    : [
        { label: 'All Products', href: '/shop' },
      ];

  return (
    <footer className="bg-primary text-primary-foreground pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Link to="/" className="flex items-center gap-3 mb-5">
              <img
                src="/TR_Tech_logo.png"
                alt="TR-Tech Logo"
                className="h-20 w-auto"
                loading="lazy"
                decoding="async"
              />
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Professional tech repairs, innovative graphic design, and quality
              tech products. Serving customers with reliable service since 2020.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-disabled="true"
                title="Facebook link coming soon"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/40 cursor-not-allowed transition-all duration-200"
                aria-label="Facebook (link pending)"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-disabled="true"
                title="Instagram link coming soon"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/40 cursor-not-allowed transition-all duration-200"
                aria-label="Instagram (link pending)"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                aria-disabled="true"
                title="TikTok link coming soon"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/40 cursor-not-allowed transition-all duration-200"
                aria-label="TikTok (link pending)"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.075em] mb-5">
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.075em] mb-5">
              Company
            </h4>
            <ul className="space-y-2.5">
              {footerNav.company.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.075em] mb-5">
              Help & Support
            </h4>
            <ul className="space-y-2.5">
              {footerNav.help.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold text-xs uppercase tracking-[0.075em] mb-5">
              Newsletter
            </h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Subscribe for exclusive offers and tech news.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-foreground/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-primary-foreground/5 border border-primary-foreground/15 text-primary-foreground placeholder-primary-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary-foreground/40 transition-colors min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                disabled={!email.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary-foreground text-primary font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60 transition-all min-h-[44px]"
              >
                <Send className="h-4 w-4" />
                {isSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

          <div className="border-t border-primary-foreground/10 mt-10 pt-6 flex flex-col sm:justify-between sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            &copy; {year} TR-Tech Repairs & Designs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
