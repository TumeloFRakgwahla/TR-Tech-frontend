/**
 * Main App Component
 *
 * This is the root component of our React application. It sets up client-side routing
 * using React Router, allowing users to navigate between different pages of the website.
 *
 * The app uses BrowserRouter for clean URLs (no hash symbols), and defines routes
 * for each main page of the TR Tech Repairs and Designs website.
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/HomePage';
import About from './pages/AboutPage';
import Services from './pages/ServicesPage';
import Shop from './pages/ShopPage';
import ProductDetail from './pages/ProductDetailPage';
import Contact from './pages/ContactPage';
import { RepairsPage } from './pages/RepairsPage';
import AdminLogin from './pages/Admin/AdminLoginPage';
import AdminDashboard from './pages/Admin/AdminDashboardPage';
import AdminProducts from './pages/Admin/AdminProductsPage';
import AdminRepairs from './pages/Admin/AdminRepairsPage';
import AdminOrders from './pages/Admin/AdminOrdersPage';
import { AdminLayout } from './pages/Admin/AdminLayout';
import { AdminDashboard as NewAdminDashboard } from './pages/Admin/AdminDashboard';
import { ProductManagement } from './pages/Admin/ProductManagement';
import { OrderManagement } from './pages/Admin/OrderManagement';
import { CustomerManagement } from './pages/Admin/CustomerManagement';
import { InventoryManagement } from './pages/Admin/InventoryManagement';
import { MarketingManagement } from './pages/Admin/MarketingManagement';
import { ReportsAnalytics } from './pages/Admin/ReportsAnalytics';
import { UserManagement } from './pages/Admin/UserManagement';
import { CartProvider } from './components/CartContext';
import { AuthProvider } from './components/AuthContext';

function App() {
  return (
    // BrowserRouter enables client-side routing for the entire app
    <Router>
      <AuthProvider>
        <CartProvider>
        {/* Routes component contains all our route definitions */}
        <Routes>
          {/* Each Route maps a URL path to a React component */}
          <Route path="/" element={<Home />} />           {/* Homepage */}
          <Route path="/about" element={<About />} />     {/* About Us page */}
          <Route path="/services" element={<Services />} /> {/* Services offered */}
          <Route path="/shop" element={<Shop />} />       {/* Online shop */}
          <Route path="/products/:id" element={<ProductDetail />} /> {/* Product details */}
          <Route path="/book-repair" element={<RepairsPage />} /> {/* Repair booking */}
          <Route path="/contact" element={<Contact />} /> {/* Contact information */}
          <Route path="/admin/login" element={<AdminLogin />} /> {/* Admin login */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<NewAdminDashboard />} />
            <Route path="dashboard" element={<NewAdminDashboard />} />
            <Route path="products" element={<ProductManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="inventory" element={<InventoryManagement />} />
            <Route path="marketing" element={<MarketingManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
          <Route path="/admin/products" element={<AdminProducts />} /> {/* Admin products */}
          <Route path="/admin/repairs" element={<AdminRepairs />} /> {/* Admin repairs */}
          <Route path="/admin/orders" element={<AdminOrders />} /> {/* Admin orders */}
        </Routes>
        </CartProvider>
        </AuthProvider>
    </Router>
  );
}

export default App;