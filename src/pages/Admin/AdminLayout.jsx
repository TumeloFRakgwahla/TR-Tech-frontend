import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/AuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '../../components/Sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Megaphone,
  BarChart3,
  UserCog,
  Wrench,
} from 'lucide-react';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/products', icon: Package, label: 'Products' },
  { path: '/admin/repairs', icon: Wrench, label: 'Repairs' },
  { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/admin/customers', icon: Users, label: 'Customers' },
  { path: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
  { path: '/admin/marketing', icon: Megaphone, label: 'Marketing' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { path: '/admin/users', icon: UserCog, label: 'User Management' },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-900">
        {/* Fixed Sidebar */}
        <div className="fixed left-0 top-0 h-full z-40">
          <Sidebar className="!bg-slate-950">
            <SidebarHeader>
              <div className="flex items-center space-x-2 px-4 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">TR</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">TR Tech Admin</h2>
                  <p className="text-sm text-slate-400">Management Portal</p>
                </div>
              </div>
            </SidebarHeader>
            <div className="border-b border-slate-600 mx-4"></div>
            <SidebarContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => navigate(item.path)}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.label}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-2 text-white hover:bg-red-600 rounded-lg transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </SidebarFooter>
          </Sidebar>
        </div>

        {/* Main Content with Fixed Header */}
        <div className="flex-1 ml-64">
           <header className="fixed bg-slate-950 top-0 left-64 right-0 z-30">
             <div className="flex justify-between items-center px-6 py-4">
               <div className="flex items-center">
                 <SidebarTrigger />
                 <div className="ml-4">
                   <h1 className="text-2xl font-bold text-white">
                     {navItems.find((item) => isActive(item.path))?.label ||
                       'Dashboard'}
                   </h1>
                   <p className="text-sm text-slate-400">
                     Welcome to TR-Tech Admin Portal
                   </p>
                 </div>
              </div>
              <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
                <p className="text-xs text-slate-400 capitalize">{user?.role || 'Administrator'}</p>
              </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">A</span>
                </div>
              </div>
            </div>
          </header>

          <main className="pt-20 bg-slate-900 min-h-screen p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}