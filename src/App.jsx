import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Providers } from './components/Providers';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import Home from './pages/HomePage';
import About from './pages/AboutPage';
import Services from './pages/ServicesPage';
import Shop from './pages/ShopPage';
import ProductDetail from './pages/ProductDetailPage';
import Contact from './pages/ContactPage';
import { RepairsPage } from './pages/RepairsPage';
import Cart from './pages/CartPage';
import Checkout from './pages/CheckoutPage';
import Wishlist from './pages/WishlistPage';
import AdminLogin from './pages/Admin/AdminLoginPage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AccountLayout } from './components/AccountLayout';

const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminRepairs = React.lazy(() => import('./pages/Admin/AdminRepairsPage'));
const ProductManagement = React.lazy(() => import('./pages/Admin/ProductManagement'));
const OrderManagement = React.lazy(() => import('./pages/Admin/OrderManagement'));
const CustomerManagement = React.lazy(() => import('./pages/Admin/CustomerManagement'));
const InventoryManagement = React.lazy(() => import('./pages/Admin/InventoryManagement'));
const MarketingManagement = React.lazy(() => import('./pages/Admin/MarketingManagement'));
const ReportsAnalytics = React.lazy(() => import('./pages/Admin/ReportsAnalytics'));
const UserManagement = React.lazy(() => import('./pages/Admin/UserManagement'));

const AccountDashboard = React.lazy(() => import('./pages/account/AccountDashboard'));
const ProfilePage = React.lazy(() => import('./pages/account/ProfilePage'));
const AddressesPage = React.lazy(() => import('./pages/account/AddressesPage'));
const OrdersPage = React.lazy(() => import('./pages/account/OrdersPage'));
const OrderDetailPage = React.lazy(() => import('./pages/account/OrderDetailPage'));
const AccountRepairsPage = React.lazy(() => import('./pages/account/AccountRepairsPage'));
const RepairDetailPage = React.lazy(() => import('./pages/account/RepairDetailPage'));
const SecurityPage = React.lazy(() => import('./pages/account/SecurityPage'));
const NotificationsPage = React.lazy(() => import('./pages/account/NotificationsPage'));
const PaymentMethodsPage = React.lazy(() => import('./pages/account/PaymentMethodsPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Providers>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/book-repair" element={<RepairsPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/wishlist" element={<Wishlist />} />
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
            <Route
              path="/account"
              element={
                <ProtectedRoute redirectTo="/">
                  <AccountLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AccountDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="addresses" element={<AddressesPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
              <Route path="repairs" element={<AccountRepairsPage />} />
              <Route path="repairs/:repairId" element={<RepairDetailPage />} />
              <Route path="security" element={<SecurityPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="payment-methods" element={<PaymentMethodsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Providers>
  );
}

export default App;
