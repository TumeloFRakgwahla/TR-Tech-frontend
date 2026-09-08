export const STATUS_CONFIG = {
  order: {
    Pending: { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'Pending' },
    Confirmed: { color: 'bg-blue-600', textColor: 'text-blue-400', label: 'Confirmed' },
    Processing: { color: 'bg-indigo-600', textColor: 'text-indigo-400', label: 'Processing' },
    Shipped: { color: 'bg-purple-600', textColor: 'text-purple-400', label: 'Shipped' },
    Delivered: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Delivered' },
    Completed: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Completed' },
    Cancelled: { color: 'bg-red-600', textColor: 'text-red-400', label: 'Cancelled' },
  },
  repair: {
    New: { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'New' },
    Pending: { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'Pending' },
    Diagnosing: { color: 'bg-orange-600', textColor: 'text-orange-400', label: 'Diagnosing' },
    'Awaiting Parts': { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'Awaiting Parts' },
    'In Progress': { color: 'bg-blue-600', textColor: 'text-blue-400', label: 'In Progress' },
    Ready: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Ready' },
    Completed: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Completed' },
    Cancelled: { color: 'bg-red-600', textColor: 'text-red-400', label: 'Cancelled' },
  },
  product: {
    Active: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Active' },
    Inactive: { color: 'bg-slate-600', textColor: 'text-slate-400', label: 'Inactive' },
    'Out of Stock': { color: 'bg-red-600', textColor: 'text-red-400', label: 'Out of Stock' },
  },
  inventory: {
    'In Stock': { color: 'bg-green-600', textColor: 'text-green-400', label: 'In Stock' },
    'Low Stock': { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'Low Stock' },
    'Out of Stock': { color: 'bg-red-600', textColor: 'text-red-400', label: 'Out of Stock' },
  },
  user: {
    Active: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Active' },
    Inactive: { color: 'bg-red-600', textColor: 'text-red-400', label: 'Inactive' },
  },
  role: {
    admin: { color: 'bg-blue-600', textColor: 'text-blue-400', label: 'Admin' },
    manager: { color: 'bg-purple-600', textColor: 'text-purple-400', label: 'Manager' },
    staff: { color: 'bg-slate-600', textColor: 'text-slate-400', label: 'Staff' },
    customer: { color: 'bg-slate-600', textColor: 'text-slate-400', label: 'Customer' },
  },
  payment: {
    Pending: { color: 'bg-yellow-600', textColor: 'text-yellow-400', label: 'Pending' },
    Paid: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Paid' },
    Refunded: { color: 'bg-red-600', textColor: 'text-red-400', label: 'Refunded' },
  },
  marketing: {
    Active: { color: 'bg-green-600', textColor: 'text-green-400', label: 'Active' },
    Inactive: { color: 'bg-slate-600', textColor: 'text-slate-400', label: 'Inactive' },
  },
};

export function getStatusConfig(status, type = 'order') {
  const normalized = status || 'Inactive';
  const config = STATUS_CONFIG[type] || STATUS_CONFIG.order;
  return config[normalized] || { color: 'bg-slate-600', textColor: 'text-slate-400', label: normalized };
}

export function getInventoryStatus(stock, threshold = 10) {
  const count = Number(stock) || 0;
  if (count === 0) return getStatusConfig('Out of Stock', 'inventory');
  if (count <= threshold) return getStatusConfig('Low Stock', 'inventory');
  return getStatusConfig('In Stock', 'inventory');
}

export function getRoleConfig(role) {
  const normalized = (role || 'customer').toLowerCase();
  return STATUS_CONFIG.role[normalized] || STATUS_CONFIG.role.customer;
}

export const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/dashboard': 'Dashboard',
  '/admin/products': 'Products',
  '/admin/categories': 'Categories',
  '/admin/brands': 'Brands',
  '/admin/services': 'Services',
  '/admin/repairs': 'Repairs',
  '/admin/orders': 'Orders',
  '/admin/inventory': 'Inventory',
  '/admin/marketing': 'Marketing',
  '/admin/reports': 'Reports',
  '/admin/customers': 'Customers',
  '/admin/users': 'User Management',
  '/admin/users/add': 'Add User',
  '/admin/users/roles': 'Roles & Permissions',
  '/admin/users/admins': 'Admin Users',
  '/admin/users/logs': 'Activity Logs',
};

export const PAGE_SUBTITLES = {
  '/admin': 'Welcome to TR-Tech Admin Portal',
  '/admin/dashboard': 'Welcome to TR-Tech Admin Portal',
  '/admin/products': 'Manage your product catalog and inventory',
  '/admin/categories': 'Manage product categories',
  '/admin/brands': 'Manage product brands',
  '/admin/services': 'Manage your service catalog and pricing',
  '/admin/repairs': 'Manage repair requests and track progress',
  '/admin/orders': 'View and manage customer orders',
  '/admin/inventory': 'Monitor and manage product stock levels',
  '/admin/marketing': 'Manage coupons, campaigns, and promotional content',
  '/admin/reports': 'View business insights and performance metrics',
  '/admin/customers': 'View and manage customer information',
  '/admin/users': 'Manage user accounts and permissions',
  '/admin/users/add': 'Create a new user account',
  '/admin/users/roles': 'Configure roles and their permissions',
  '/admin/users/admins': 'Manage administrative users',
  '/admin/users/logs': 'View system activity and audit trail',
};

export const ADMIN_GROUPS = [
  { id: 'overview', label: 'Overview', items: ['/admin', '/admin/dashboard'] },
  { id: 'storefront', label: 'Storefront', items: ['/admin/products', '/admin/categories', '/admin/brands', '/admin/services'] },
  { id: 'operations', label: 'Operations', items: ['/admin/repairs', '/admin/orders', '/admin/inventory'] },
  { id: 'insights', label: 'Insights', items: ['/admin/marketing', '/admin/reports'] },
  { id: 'customers', label: 'Customers', items: ['/admin/customers', '/admin/users'] },
];

export function getPageTitle(pathname) {
  return PAGE_TITLES[pathname] || 'Dashboard';
}

export function getPageSubtitle(pathname) {
  return PAGE_SUBTITLES[pathname] || 'Manage your store';
}

export function buildBreadcrumbs(pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const crumbs = [{ label: 'Dashboard', path: '/admin' }];
  let current = '';
  segments.forEach((segment) => {
    current += `/${segment}`;
    if (current.startsWith('/admin') && current !== '/admin') {
      const title = PAGE_TITLES[current] || segment.charAt(0).toUpperCase() + segment.slice(1);
      crumbs.push({ label: title, path: current });
    }
  });
  return crumbs;
}

export { cn } from './utils';
