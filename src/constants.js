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
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

// Product Categories
export const PRODUCT_CATEGORIES = [
  'Accessories',
  'Parts',
  'Tools',
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
