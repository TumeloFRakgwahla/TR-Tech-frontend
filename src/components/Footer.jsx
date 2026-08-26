/**
 * Footer Component
 *
 * High-end e-commerce footer with refined typography,
 * organized navigation columns, newsletter signup,
 * social media presence, and payment method badges.
 * Maintains brand consistency via the project's CSS variable system.
 */

import React, { useState } from 'react';
import {
  Facebook,
  Instagram,
  Mail,
  Send,
} from 'lucide-react';
import { WHATSAPP_BASE_URL } from '../constants';

const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const VisaIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.167 0H2.833C1.272 0 .042 1.23.042 2.79v14.42c0 1.56 1.23 2.79 2.79 2.79h26.33c1.56 0 2.79-1.23 2.79-2.79V2.79C31.958 1.23 30.728 0 29.167 0z" fill="#1F1F73"/>
    <path d="M28.5 10.5c0 .23-.01.45-.03.67 0 .04.01.07.01.11-.01.04-.28 2.05-.89 4.05-.62 2-1.41 3.58-2.36 4.73.01 0 .01-.01.01-.01 1.07-1.27 2.11-2.87 3.09-4.8.03-.05.06-.11.09-.16.05-.09.09-.19.13-.29-.07.02-.14.03-.21.04z" fill="#FF6600"/>
    <path d="M15.36 11.5c0-.29-.03-.57-.08-.85l-.01-.03c-.13-.55-.42-1.06-.83-1.48-.64-.65-1.52-.97-2.44-.97h-.02c-.92 0-1.8.32-2.44.97-.41.42-.7 1.01-.82 1.65-.04.16-.05.33-.05.5 0 .27.02.55.05.83-.05.12-.1.23-.16.36-.02.05-.03.11-.05.16-.02-.01-.05-.02-.07-.03-.64-.26-1.15-.79-1.35-1.46-.06-.22-.09-.45-.09-.68 0-.89 1.05-1.61 2.35-1.61 1.05 0 1.94.57 2.46 1.4l.02.03c.03.06.06.11.08.17.01.04 0 .09-.02.13C9.05 11.37 9 11.45 9 11.5c0 .05.02.09.03.14l.01.03c.02.1.04.19.07.29-.02.01-.04.02-.06.03-.03 0-.06.02-.09.03-.02 0-.04 0-.06.01-.64.21-1.15.72-1.33 1.39-.05.18-.07.37-.07.56 0 .88 1.04 1.59 2.33 1.59.92 0 1.77-.47 2.28-1.19l.02-.03.03-.05c.04-.05.08-.12.1-.19-.03-.02-.06-.04-.09-.06z" fill="#0066BA"/>
  </svg>
);

const MastercardIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.167 0H2.833C1.272 0 .042 1.23.042 2.79v14.42c0 1.56 1.23 2.79 2.79 2.79h26.33c1.56 0 2.79-1.23 2.79-2.79V2.79C31.958 1.23 30.728 0 29.167 0z" fill="#000000"/>
    <path d="M16 14.25c3.505 0 6.337-2.863 6.337-6.375S19.505 1.5 16 1.5 9.663 4.363 9.663 7.875s2.833 6.375 6.337 6.375z" fill="#FF6600"/>
    <path d="M18.89 7.875c0 1.583-.75 2.958-1.915 3.841l-2.36 1.426c-.194.118-.395.22-.615.303v-3.537l.005-.002.001-.041v-.083c.001-.028-.001-.055-.001-.083v-2.532l-3.368-2.034c.495-1.176 1.738-2.014 3.129-2.014 1.574 0 2.934 1.031 3.45 2.467l2.98-1.8v.02c1.992.01 3.597 1.677 3.613 3.669l.004.036.008.05v.036c0 1.583-.75 2.958-1.915 3.841l-2.36 1.426c-.194.118-.395.22-.615.303v-3.537l-.005-.002v-.11c.015-.952-.076-1.9-1.147-2.589z" fill="#0F6ABF"/>
    <path d="M20.5 5.25l1.395-2.25A6.31 6.31 0 0 0 21.337 1.5c-1.094-.145-2.188.099-3.099.615a3.53 3.53 0 0 0 1.129 1.77l1.131.365z" fill="#0066BA"/>
    <path d="M7.192 7.5l6.036 3.65 6.036-3.65v-.042c.016-.01.031-.018.048-.027v-4.32c0-.007.008-.012.013-.018v-.058v-.016a6.387 6.387 0 0 0-1.14-.532 6.262 6.262 0 0 0-2.24-.427h-5.17c-.027.003-.054.007-.081.01-.053.009-.106.02-0.159.032v-.011c-.001 0-.001.001-.001.002v3.603c.016-.011.031-.018.048-.027v-.54z" fill="#0066BA"/>
    <path d="M15.3 11.55c-.02 0-.039-.001-.058-.002v2.937c.015.001.031.003.046.003.172.001.344-.015.469-.089.156-.09.269-.256.297-.423v-2.436h-.001l.002-.016v-.054c0-.143-.002-.285-.006-.421h-.698l.007 0z" fill="#FFFFFF"/>
  </svg>
);

const PayFastIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.167 0H2.833C1.272 0 .042 1.23.042 2.79v14.42c0 1.56 1.23 2.79 2.79 2.79h26.33c1.56 0 2.79-1.23 2.79-2.79V2.79C31.958 1.23 30.728 0 29.167 0z" fill="#0F6BBF"/>
    <path d="M25.3 10v-3h-1v3h-1V7h-1v3h-1V7h-1v3h-1V7h-1v3H9V7H8v6h1v-3h1v3h1v-3h1v3h1v-3h1v3h1v-3h1v3h1V7h1v3z" fill="#FFFFFF"/>
    <path d="M8 11V7H7v6h1v-2h.04L8 11zm6 0V7h-1v6h1v-2h.04L14 11zm6 0V7h-.96l-.04 2.04V11h1zm.95-2v4h.05v-4h-.05z" fill="#FFD900"/>
    <path d="M11.5 13.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22 2.62 0 2.62v1.88c0 .28-.22.5-.5.5s-.5-.22-.5-.5v-1.88c0-1.1.9-2 2-2h.05c.28 0 .5.22.5.5s-.22.5-.5.5h-.05z" fill="#FF6600"/>
  </svg>
);

const OzowIcon = () => (
  <svg className="h-6 w-6" viewBox="0 0 32 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M29.167 0H2.833C1.272 0 .042 1.23.042 2.79v14.42c0 1.56 1.23 2.79 2.79 2.79h26.33c1.56 0 2.79-1.23 2.79-2.79V2.79C31.958 1.23 30.728 0 29.167 0z" fill="#065FD4"/>
    <path d="M16 14.79c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-.93c2.26 0 4.07-1.8 4.07-4.02s-1.81-4.02-4.07-4.02-4.07 1.81-4.07 4.02 1.81 4.02 4.07 4.02z" fill="#E8F0FE"/>
    <path d="M16 10.13c.99 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8-1.8.8-1.8 1.8.8 1.8 1.8 1.8zM12 9.2V14c0 .44.27.83.66 1l-.12.44.56 2.1h3.5l.56-2.1-.12-.44c.39-.17.66-.56.66-1v-4.8h-5.28z" fill="#FFFFFF"/>
    <path d="M21.23 11.77c-.13-.01-.25-.03-.37-.06a3.11 3.11 0 0 1-.28-1.01 2.69 2.69 0 0 1-.19-1.41c0-.23.05-.46.13-.68.1-.27.24-.52.41-.72.18-.22.38-.41.6-.55.24-.16.5-.29.79-.35.16-.04.33-.05.49-.05.14-.01.28 0 .42.01.14.02.27.04.4.1.27.12.52.3 1.01.6 0 0-.33.4-.46.59-.13.16-.25.33-.25.53 0 .23.05.44.15.63.1.19.21.35.34.47.24.21.54.35.84.35.04-.24.09-.49.21-.71.17-.29.41-.53.67-.69.27-.16.55-.28.84-.31.27-.04.56-.02.83.04 1.4.3 2.44 1.42 2.44 2.84s-1.01 2.5-2.29 2.77v.01c-.04.17-.09.34-.15.5-.08.19-.19.36-.31.51a.96.96 0 0 1-.56.34 2.53 2.53 0 0 1-.73.1h-.11zm-2.75-.21a2.45 2.45 0 0 1-.23-.4 1.84 1.84 0 0 1-.19.83c-.27.48-1.37.86-1.97.86-.34 0-.61-.06-.61-.06l-.08.37c-1.96.34-3.24 1.97-3.24 3.99v2.43c0 .25.04.49.12.71l.12.37h3.35l.14-.37c.08-.21.11-.44.07-.66l-.02-.12a3.21 3.21 0 0 0 2.1-.26c.31-.14.62-.32.89-.53a3.07 3.07 0 0 0 .7-.52l-.07-.33a2.03 2.03 0 0 1-1.09-.54 2.45 2.45 0 0 1-.18-.15 1.71 1.71 0 0 0-.39-.24c-.13-.07-.26-.13-.39-.17a1.57 1.57 0 0 0-.12-.03v-.02zm-1.54 5.91v-1.49a3.41 3.41 0 0 0 1.98.59 3.22 3.22 0 0 0 2-.58v1.82l-.18.14c-.82.64-2.24.96-3.51.73l-.17-.11z" fill="#FFFFFF"/>
    <path d="M22.5 16.26c-.24-.02-2.36-.29-4.18-.29s-3.94.27-4.18.29h-.06v-1.51c.15-.03 1.37-.21 2.79-.38 1.42-.16 2.4-.59 2.4-.59.01.01.6 1.01 1.59 1.67.99.65 2.17 1 3.5 1 1.33-.01 2.51-.36 3.5-1.01.99-.66 1.59-1.66 1.59-1.67s.98.03 2.4.59c1.42.17 2.64.35 2.79.38v1.51h-.06c-.24 0-2.36.27-4.18.27z" fill="#FFD900"/>
  </svg>
);

const paymentBadges = [
  { name: 'Visa', Icon: VisaIcon },
  { name: 'Mastercard', Icon: MastercardIcon },
  { name: 'PayFast', Icon: PayFastIcon },
  { name: 'Ozow', Icon: OzowIcon },
];

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
    { label: 'Track Order', href: '/account/orders' },
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

  return (
    <footer className="bg-primary text-primary-foreground pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <a href="/" className="flex items-center gap-3 mb-5">
              <img
                src="/TR_Tech_logo.png"
                alt="TR-Tech Logo"
                className="h-20 w-auto"
                loading="lazy"
                decoding="async"
              />
            </a>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Professional tech repairs, innovative graphic design, and quality
              tech products. Serving customers with reliable service since 2020.
            </p>
            <div className="flex space-x-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/20 transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/20 transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-primary-foreground/10 rounded-xl flex items-center justify-center text-primary-foreground/80 hover:text-white hover:bg-primary-foreground/20 transition-all duration-200"
                aria-label="TikTok"
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
              {footerNav.shop.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
                  <a
                    href={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
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
          <div className="flex flex-wrap gap-3 items-center">
            {paymentBadges.map(({ name, Icon }) => (
              <div
                key={name}
                className="h-9 px-3 bg-primary-foreground/5 border border-primary-foreground/15 rounded-lg flex items-center justify-center"
                aria-label={name}
              >
                <Icon />
              </div>
            ))}
          </div>
          <p className="text-sm text-primary-foreground/60">
            &copy; {year} TR-Tech Repairs & Designs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
