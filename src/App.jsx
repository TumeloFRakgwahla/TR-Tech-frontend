/**
 * TR-Tech Frontend — Root Application Component
 *
 * Defines the entire client-side route tree for the TR-Tech platform.
 * Uses React.lazy + Suspense for code-splitting heavy admin/account routes
 * so the initial bundle only contains public-facing pages.
 *
 * Structure:
 * 1. Public routes — home, shop, services, repairs, contact, etc.
 * 2. Admin routes  — protected by AdminProtectedRoute, lazy-loaded
 * 3. Account routes — protected by ProtectedRoute, lazy-loaded
 *
 * The nested <Route> pattern under /admin and /account enables layout
 * components (AdminLayout, AccountLayout) to wrap child routes via
 * <Outlet />, keeping navigation/sidebar logic in one place.
 */

import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Providers wrap the entire app with auth, cart, wishlist, and UI contexts
import { Providers } from './components/Providers';
import CookieConsent from './components/CookieConsent';

// Route guards prevent unauthenticated access to protected areas
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';

// Global error boundary catches render errors and shows a fallback UI
import { ErrorBoundary } from './components/ErrorBoundary';

// Public pages — eagerly loaded for fast initial navigation
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
import NotFoundPage from './pages/NotFoundPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';

// Admin pages — lazy loaded to reduce initial bundle size
import AdminLogin from './pages/Admin/AdminLoginPage';
import { AdminLayout } from './pages/Admin/AdminLayout';

// Account pages — lazy loaded; only fetched when user navigates to /account
import { AccountLayout } from './components/AccountLayout';

/**
 * Lazy-loaded admin modules.
 * React.lazy splits these into separate chunks loaded on demand.
 */
const AdminDashboard = React.lazy(() => import('./pages/Admin/AdminDashboard'));
const AdminRepairs = React.lazy(() => import('./pages/Admin/AdminRepairsPage'));
const ProductManagement = React.lazy(() => import('./pages/Admin/ProductManagement'));
const ServicesManagement = React.lazy(() => import('./pages/Admin/ServicesManagement'));
const OrderManagement = React.lazy(() => import('./pages/Admin/OrderManagement'));
const CustomerManagement = React.lazy(() => import('./pages/Admin/CustomerManagement'));
const InventoryManagement = React.lazy(() => import('./pages/Admin/InventoryManagement'));
const MarketingManagement = React.lazy(() => import('./pages/Admin/MarketingManagement'));
const ReportsAnalytics = React.lazy(() => import('./pages/Admin/ReportsAnalytics'));
const UserManagement = React.lazy(() => import('./pages/Admin/UserManagement'));
const AdminCategories = React.lazy(() => import('./pages/Admin/AdminCategoriesPage'));
const AdminBrands = React.lazy(() => import('./pages/Admin/AdminBrandsPage'));

/**
 * Lazy-loaded customer account modules.
 */
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

/**
 * Loading fallback shown while lazy chunks are being fetched.
 * Suspense requires a fallback for every lazy boundary.
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    // Providers must be outermost so all descendants can access context
    <Providers>
      {/* ErrorBoundary catches any render-phase or lifecycle errors */}
      <ErrorBoundary>
        {/* Suspense wraps lazy routes so the PageLoader shows during chunk fetches */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* ── Public Routes ─────────────────────────────── */}
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
            <Route path="/track-order" element={<TrackOrderPage />} />
            <Route path="/order-confirmation" element={<OrderConfirmationPage />} />

            {/* ── Admin Routes ─────────────────────────────── */}
            {/* Admin login is public; everything else under /admin requires admin auth */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminLayout />
                </AdminProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="products" element={<ProductManagement />} />
              <Route path="services" element={<ServicesManagement />} />
              <Route path="orders" element={<OrderManagement />} />
              <Route path="customers" element={<CustomerManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="marketing" element={<MarketingManagement />} />
              <Route path="reports" element={<ReportsAnalytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="repairs" element={<AdminRepairs />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
            </Route>

            {/* ── Customer Account Routes ─────────────────── */}
            {/* All /account routes require an authenticated customer session */}
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

            {/* ── Catch-all Route ───────────────────────────── */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>

      {/* Cookie Consent Banner - visible on all pages until accepted */}
      <CookieConsent />
    </Providers>
  );
}

export default App;
