import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAccount } from './AccountContext';
import { authAPI } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';
import {
  LayoutDashboard,
  User,
  MapPin,
  ShoppingBag,
  Wrench,
  Shield,
  Bell,
  LogOut,
  ChevronRight,
  MailWarning,
  CreditCard,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './button.jsx';

const navItems = [
  { path: '/account', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/account/profile', icon: User, label: 'Profile' },
  { path: '/account/addresses', icon: MapPin, label: 'Addresses' },
  { path: '/account/orders', icon: ShoppingBag, label: 'Orders' },
  { path: '/account/repairs', icon: Wrench, label: 'Repairs' },
  { path: '/account/security', icon: Shield, label: 'Security' },
  { path: '/account/notifications', icon: Bell, label: 'Notifications' },
  { path: '/account/payment-methods', icon: CreditCard, label: 'Payment Methods' },
];

export function AccountLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { loading } = useAccount();
  const [resending, setResending] = useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setResending(true);
    try {
      await authAPI.resendVerification(user.email);
      toast.success('Verification email sent. Please check your inbox.');
    } catch {
      toast.error('Could not send verification email');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                      {(user?.firstName || user?.name || 'U').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {user?.firstName} {user?.lastName}
                      </h2>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors group ${
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                      <ChevronRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </NavLink>
                  ))}
                  <div className="border-t border-gray-200 mt-2 pt-2">
                    <button
                      onClick={() => navigate('/')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                    >
                      <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Continue Shopping</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1"
                    >
                      <LogOut className="h-5 w-5 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              {user && user.emailVerified === false && (
                <div className="mb-6 flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <MailWarning className="h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">Please verify your email address to secure your account.</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resending}
                    onClick={handleResendVerification}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100"
                  >
                    {resending ? 'Sending…' : 'Resend email'}
                  </Button>
                </div>
              )}
              <Outlet />
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default AccountLayout;
