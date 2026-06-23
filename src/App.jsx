import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { CartProvider } from './components/CartContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/HomePage';
import About from './pages/AboutPage';
import Services from './pages/ServicesPage';
import Shop from './pages/ShopPage';
import ProductDetail from './pages/ProductDetailPage';
import Contact from './pages/ContactPage';
import { RepairsPage } from './pages/RepairsPage';
import AdminLogin from './pages/Admin/AdminLoginPage';
import { AdminLayout } from './pages/Admin/AdminLayout';

const AdminDashboard = React.lazy(() =>
  import('./pages/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminRepairs = React.lazy(() =>
  import('./pages/Admin/AdminRepairsPage').then((m) => ({ default: m.AdminRepairsPage }))
);
const ProductManagement = React.lazy(() =>
  import('./pages/Admin/ProductManagement').then((m) => ({ default: m.ProductManagement }))
);
const OrderManagement = React.lazy(() =>
  import('./pages/Admin/OrderManagement').then((m) => ({ default: m.OrderManagement }))
);
const CustomerManagement = React.lazy(() =>
  import('./pages/Admin/CustomerManagement').then((m) => ({ default: m.CustomerManagement }))
);
const InventoryManagement = React.lazy(() =>
  import('./pages/Admin/InventoryManagement').then((m) => ({ default: m.InventoryManagement }))
);
const MarketingManagement = React.lazy(() =>
  import('./pages/Admin/MarketingManagement').then((m) => ({ default: m.MarketingManagement }))
);
const ReportsAnalytics = React.lazy(() =>
  import('./pages/Admin/ReportsAnalytics').then((m) => ({ default: m.ReportsAnalytics }))
);
const UserManagement = React.lazy(() =>
  import('./pages/Admin/UserManagement').then((m) => ({ default: m.UserManagement }))
);

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/book-repair" element={<RepairsPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<ProductManagement />} />
                <Route path="orders" element={<OrderManagement />} />
                <Route path="customers" element={<CustomerManagement />} />
                <Route path="inventory" element={<InventoryManagement />} />
                <Route path="marketing" element={<MarketingManagement />} />
                <Route path="reports" element={<ReportsAnalytics />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="repairs" element={<AdminRepairs />} />
              </Route>
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
