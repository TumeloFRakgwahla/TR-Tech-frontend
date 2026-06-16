// Mock data for admin dashboard

export const dashboardStats = {
  totalRevenue: 98234,
  revenueChange: 12.5,
  totalOrders: 1245,
  ordersChange: 8.3,
  totalCustomers: 3456,
  customersChange: 15.2,
  productsSold: 2456,
  salesChange: 10.1,
};

export const salesData = [
  { month: 'Jan', revenue: 12000, sales: 150 },
  { month: 'Feb', revenue: 15000, sales: 180 },
  { month: 'Mar', revenue: 18000, sales: 220 },
  { month: 'Apr', revenue: 22000, sales: 250 },
  { month: 'May', revenue: 25000, sales: 280 },
  { month: 'Jun', revenue: 28000, sales: 320 },
];

export const topProducts = [
  { name: 'iPhone 15 Pro Max', sales: 456, revenue: 45600 },
  { name: 'MacBook Pro 16"', sales: 234, revenue: 46800 },
  { name: 'Sony WH-1000XM5', sales: 345, revenue: 20700 },
  { name: 'Samsung Galaxy S24', sales: 289, revenue: 14450 },
  { name: 'iPad Air', sales: 198, revenue: 11790 },
];

export const orders = [
  { id: '#ORD-001', customer: 'John Smith', date: '2026-06-15', items: 3, total: 1245.99, status: 'Delivered' },
  { id: '#ORD-002', customer: 'Sarah Johnson', date: '2026-06-15', items: 1, total: 899.99, status: 'Shipped' },
  { id: '#ORD-003', customer: 'Mike Davis', date: '2026-06-14', items: 2, total: 1549.98, status: 'Processing' },
  { id: '#ORD-004', customer: 'Emma Wilson', date: '2026-06-14', items: 1, total: 2499.99, status: 'Pending' },
  { id: '#ORD-005', customer: 'David Brown', date: '2026-06-13', items: 4, total: 789.96, status: 'Delivered' },
];

export const customers = [
  { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1 (555) 123-4567', orders: 12, totalSpent: 3456.50, joinDate: '2025-01-15', status: 'Active' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 (555) 234-5678', orders: 8, totalSpent: 2123.40, joinDate: '2025-03-22', status: 'Active' },
  { id: 3, name: 'Mike Davis', email: 'mike@example.com', phone: '+1 (555) 345-6789', orders: 15, totalSpent: 4567.80, joinDate: '2024-11-05', status: 'Active' },
  { id: 4, name: 'Emma Wilson', email: 'emma@example.com', phone: '+1 (555) 456-7890', orders: 5, totalSpent: 1234.50, joinDate: '2025-05-10', status: 'Active' },
  { id: 5, name: 'David Brown', email: 'david@example.com', phone: '+1 (555) 567-8901', orders: 3, totalSpent: 890.20, joinDate: '2025-06-01', status: 'Active' },
];

export const products = [
  { id: 1, name: 'iPhone 15 Pro Max', category: 'Smartphones', brand: 'Apple', price: 1199, inStock: true, featured: true, image: 'https://placehold.co/100x100/3b82f6/white?text=iPhone' },
  { id: 2, name: 'MacBook Pro 16"', category: 'Laptops', brand: 'Apple', price: 2499, inStock: true, featured: true, image: 'https://placehold.co/100x100/16a34a/white?text=MacBook' },
  { id: 3, name: 'Sony WH-1000XM5', category: 'Audio', brand: 'Sony', price: 399, inStock: true, featured: false, image: 'https://placehold.co/100x100/9333ea/white?text=Headphones' },
  { id: 4, name: 'Samsung Galaxy S24', category: 'Smartphones', brand: 'Samsung', price: 899, inStock: true, featured: false, image: 'https://placehold.co/100x100/dc2626/white?text=Galaxy' },
  { id: 5, name: 'iPad Air', category: 'Tablets', brand: 'Apple', price: 599, inStock: true, featured: false, image: 'https://placehold.co/100x100/ca8a04/white?text=iPad' },
];