/**
 * TR-Tech Application Constants
 * 
 * Centralized constants for the application.
 * Update values here to change them across the entire app.
 *
 * Organization:
 * - Communication config (WhatsApp)
 * - API routing (base URL)
 * - UI placeholders
 * - Business domain enumerations (order/payment statuses, product conditions, etc.)
 */

// WhatsApp Configuration
// Defaults to a hardcoded South African number if VITE_WHATSAPP_NUMBER is not set
export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '27791002552';
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

// API Configuration
// In all environments, use a relative path so the same-origin proxy (Vite dev
// server, nginx, or Express static serving) handles routing. When VITE_API_URL
// is set, it takes precedence (e.g. for cross-domain staging deployments).
export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Paystack Configuration
export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

// Default product image (matches the backend Product schema default)
export const PRODUCT_PLACEHOLDER_IMAGE = 'https://placehold.co/100x100/3b82f6/white?text=TR';

// Order Status Options
// These map directly to backend enum values for order.status
export const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipped',
  'Delivered',
  'Completed',
  'Cancelled'
];

// Payment Methods
// Accepted payment method strings used in order.paymentMethod
export const PAYMENT_METHODS = [
  'Cash',
  'Card',
  'Transfer',
  'Other'
];

// Payment Status Options
// Tracks whether payment has been captured, refunded, etc.
export const PAYMENT_STATUSES = [
  'Pending',
  'Paid',
  'Refunded'
];

// Sort Options
// Used by shop/search UI to control product list ordering
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
];

// Fallback product categories (used when API is unavailable)
// Each category includes name, slug, icon, and displayOrder for admin-controlled consistency
export const FALLBACK_CATEGORIES = [
  { name: 'Smartphones', slug: 'smartphones', icon: 'Smartphone', displayOrder: 1 },
  { name: 'Laptops', slug: 'laptops', icon: 'Laptop', displayOrder: 2 },
  { name: 'Laptop Accessories', slug: 'laptop-accessories', icon: 'Cable', displayOrder: 3 },
  { name: 'Mobile Accessories', slug: 'mobile-accessories', icon: 'Headphones', displayOrder: 4 },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', displayOrder: 5 },
  { name: 'Networking', slug: 'networking', icon: 'Wifi', displayOrder: 6 },
  { name: 'Printers', slug: 'printers', icon: 'Printer', displayOrder: 7 },
  { name: 'Storage Devices', slug: 'storage-devices', icon: 'HardDrive', displayOrder: 8 },
  { name: 'Other', slug: 'other', icon: 'MoreHorizontal', displayOrder: 9 },
];

// Fallback product brands (used when API is unavailable)
export const FALLBACK_BRANDS = [
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
// Used in product listings to describe item state
export const PRODUCT_CONDITIONS = [
  'New',
  'Used',
  'Refurbished'
];

// Device Types for Repairs
// Categorizes repair bookings by hardware type
export const DEVICE_TYPES = [
  'Smartphone',
  'Laptop',
  'Desktop Computer',
  'Tablet',
  'Other'
];

// Repair Status Options
// Maps to backend repair status enum
export const REPAIR_STATUSES = [
  'New',
  'Diagnosing',
  'Awaiting Parts',
  'In Progress',
  'Ready',
  'Completed',
  'Cancelled'
];

// Service Categories
// Maps to backend service catalog categories
export const SERVICE_CATEGORIES = [
  'Phone Repair',
  'Computer Repair',
  'Tablet Repair',
  'Other'
];

// User Management Constants
export const USER_ROLES = [
  { id: 'admin', label: 'Admin', description: 'Full system access' },
  { id: 'manager', label: 'Manager', description: 'Manage products, orders, repairs' },
  { id: 'staff', label: 'Staff', description: 'Limited access to operations' },
  { id: 'customer', label: 'Customer', description: 'Customer account access' },
];

export const PERMISSIONS = {
  dashboard: { label: 'Dashboard', description: 'View dashboard and analytics' },
  products: { label: 'Products', description: 'Manage products catalog' },
  categories: { label: 'Categories', description: 'Manage product categories' },
  brands: { label: 'Brands', description: 'Manage brands' },
  services: { label: 'Services', description: 'Manage services' },
  repairs: { label: 'Repairs', description: 'Manage repair requests' },
  orders: { label: 'Orders', description: 'View and manage orders' },
  customers: { label: 'Customers', description: 'View and manage customers' },
  inventory: { label: 'Inventory', description: 'Manage stock and inventory' },
  marketing: { label: 'Marketing', description: 'Manage promotions and campaigns' },
  reports: { label: 'Reports', description: 'View reports and analytics' },
  users: { label: 'Users', description: 'Manage user accounts and permissions' },
  settings: { label: 'Settings', description: 'Manage system settings' },
};

export const ACTIVITY_LOG_ACTIONS = [
  'user.created',
  'user.updated',
  'user.deleted',
  'user.password_reset',
  'role.created',
  'role.updated',
  'role.deleted',
  'login',
  'logout',
  'settings.updated',
];

export const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.keys(PERMISSIONS),
  manager: ['dashboard', 'products', 'categories', 'brands', 'services', 'repairs', 'orders', 'customers', 'inventory', 'marketing', 'reports'],
  staff: ['dashboard', 'repairs', 'orders', 'inventory'],
  customer: [],
};
