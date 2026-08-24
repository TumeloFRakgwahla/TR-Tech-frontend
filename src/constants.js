/**
 * TR-Tech Application Constants
 * 
 * Centralized constants for the application.
 * Update values here to change them across the entire app.
 */

// WhatsApp Configuration
export const WHATSAPP_NUMBER = '27791002552';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// API Configuration
// In dev, Vite proxies /api to the backend, so use a relative path to avoid
// cross-origin requests and CSP connect-src violations.
export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api/v1' : 'http://localhost:5000/api/v1');

// Default product image (matches the backend Product schema default)
export const PRODUCT_PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/3b82f6/white?text=TR';

// Order Status Options
export const ORDER_STATUSES = [
  'Pending',
  'Processing',
  'Shipped',
  'Delivered',
  'Completed',
  'Cancelled'
];

// Payment Methods
export const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'Transfer',
  'Other'
];

// Payment Status Options
export const PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Refunded'
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Smartphones',
  'Laptops',
  'Laptop Accessories',
  'Mobile Accessories',
  'Gaming',
  'Networking',
  'Printers',
  'Storage Devices',
  'Other'
];

// Product Brands
export const PRODUCT_BRANDS = [
  'Apple',
  'Samsung',
  'HP',
  'Dell',
  'Lenovo',
  'Asus',
  'Huawei',
  'Xiaomi',
  'Sony',
  'LG',
  'Microsoft',
  'Google',
  'Other'
];

// Product Conditions
export const PRODUCT_CONDITIONS = [
  'New',
  'Used',
  'Refurbished'
];

// Device Types for Repairs
export const DEVICE_TYPES = [
  'Smartphone',
  'Laptop',
  'Desktop Computer',
  'Tablet',
  'Other'
];
