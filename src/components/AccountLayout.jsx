import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useAccount } from './AccountContext';
import { authAPI } from '../services/api';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
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
      <div className="flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Mobile: Horizontal pill tabs */}
            <div className="lg:hidden -mx-4 px-4 mb-4 overflow-x-auto scrollbar-hide">
              <div className="flex gap-2 min-w-max pb-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors min-h-[44px] ${
                        isActive
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>

            {/* Desktop: Sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
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
                        `flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors group min-h-[44px] ${
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
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors min-h-[44px]"
                    >
                      <ArrowLeft className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">Continue Shopping</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-1 min-h-[44px]"
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
                <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <div className="flex items-center gap-3 flex-1">
                    <MailWarning className="h-5 w-5 flex-shrink-0" />
                    <span>Please verify your email address to secure your account.</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={resending}
                    onClick={handleResendVerification}
                    className="border-amber-300 text-amber-800 hover:bg-amber-100 min-h-[44px] whitespace-nowrap"
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
      <BottomNav />
    </div>
  );
}

export default AccountLayout;
