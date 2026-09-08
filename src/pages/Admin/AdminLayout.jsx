import { useState, useRef, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { useAdminAuth } from '../../components/AdminAuthContext';
import {
  SidebarProvider,
  Sidebar,
  SidebarContext,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSubmenu,
  SidebarGroup,
  SidebarTrigger,
  NAV_GROUPS,
  FOOTER_ITEMS,
} from '../../components/Sidebar';
import {
  Search,
  Bell,
  Mail,
  ChevronDown,
  Settings,
  HelpCircle,
  User,
  LogOut,
} from 'lucide-react';

const NOTIFICATIONS = [
  { id: '1', title: 'New order received', message: 'Order #1234 has been placed', time: '2 min ago', read: false },
  { id: '2', title: 'Repair completed', message: 'iPhone 13 repair is ready for pickup', time: '1 hour ago', read: false },
  { id: '3', title: 'Low stock alert', message: 'iPhone 15 Pro Max has only 2 units left', time: '3 hours ago', read: true },
];

const MESSAGES = [
  { id: '1', sender: 'John Doe', subject: 'Question about iPhone repair', time: '5 min ago', unread: true },
  { id: '2', sender: 'Jane Smith', subject: 'Order delivery status', time: '1 hour ago', unread: true },
  { id: '3', sender: 'Mike Wilson', subject: 'Product return request', time: '2 hours ago', unread: false },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAdminAuth();
  const { isCollapsed } = useContext(SidebarContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [messagesOpen, setMessagesOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const messagesRef = useRef(null);

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path.split('?')[0]);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/admin?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchFocused(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target)) {
        setMessagesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <SidebarProvider>
      <div className="admin-layout flex min-h-screen">
        <Sidebar className="admin-sidebar-container">
          <SidebarHeader>
            <div className="admin-sidebar-header">
              <div className="admin-sidebar-logo">
                <img src="./TR_Tech_logo.png" alt="TR-Tech" className="w-full h-full object-contain p-0.5" />
              </div>
              <div className="admin-sidebar-brand">
                <h2 className="admin-sidebar-title">TR-Tech</h2>
                <p className="admin-sidebar-subtitle">Repairs &amp; Designs</p>
                <p className="admin-sidebar-subtitle" style={{ fontSize: '0.5625rem', letterSpacing: '0.1em', marginTop: '0.125rem' }}>Innovate. Restore. Perfect.</p>
              </div>
            </div>
          </SidebarHeader>
          <div className="admin-sidebar-divider"></div>
          <SidebarContent>
            {NAV_GROUPS.map((group) => (
              <SidebarGroup key={group.id} label={group.label} sectionId={group.id}>
                {group.items.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <SidebarMenuItem key={item.path} tooltip={item.label}>
                      <SidebarMenuButton
                        isActive={active}
                        onClick={() => navigate(item.path.split('?')[0])}
                        icon={item.icon}
                      >
                        {item.label}
                      </SidebarMenuButton>
                      {item.submenu && !isCollapsed && (
                        <SidebarSubmenu items={item.submenu} activePath={location.pathname} />
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            {FOOTER_ITEMS.filter(item => item.path !== '/admin/profile').map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="admin-sidebar-footer-item"
              >
                <span className="admin-sidebar-footer-item-icon">
                  {item.icon === 'settings' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                  {item.icon === 'help-circle' && <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                </span>
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer" style={{ backgroundColor: 'rgba(0,74,173,0.08)' }}>
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: '#004AAD' }}>{user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}</div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-xs font-semibold truncate">{user?.firstName || 'Admin'} {user?.lastName || 'User'}</p>
                  <p className="text-xs truncate" style={{ color: '#CECED1' }}>{user?.email || 'admin@trtech.co.za'}</p>
                </div>
              )}
            </div>
            <div className="admin-sidebar-divider" style={{ margin: '0.5rem 0' }}></div>
            <button
              onClick={handleLogout}
              className="admin-sidebar-footer-item admin-sidebar-footer-item-logout"
            >
              <span className="admin-sidebar-footer-item-icon">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </span>
              {!isCollapsed && <span className="truncate">Logout</span>}
            </button>
          </SidebarFooter>
        </Sidebar>

        <main className={`admin-content flex-1 min-w-0 transition-all duration-300 ${isCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
          <header className="admin-header sticky top-0 z-50">
            <div className="admin-header-inner">
              <SidebarTrigger />
              <div className={`admin-header-search ${searchFocused ? 'focused' : ''}`}>
                <Search className="h-4 w-4 flex-shrink-0" style={{ color: 'rgb(var(--tr-text-muted))' }} />
                <input
                  type="text"
                  placeholder="Search products, orders, customers..."
                  className="admin-header-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={handleSearch}
                />
              </div>
              <div className="admin-header-actions">
                <div className="relative" ref={notificationsRef}>
                  <button
                    className="admin-header-btn"
                    aria-label="Notifications"
                    onClick={() => { setNotificationsOpen(!notificationsOpen); setMessagesOpen(false); }}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="admin-notification-badge"></span>
                  </button>
                  {notificationsOpen && (
                    <div className="admin-dropdown open" style={{ right: 0, minWidth: '20rem', maxHeight: '24rem', overflowY: 'auto' }}>
                      <div className="px-3 py-2 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white">Notifications</p>
                      </div>
                      {NOTIFICATIONS.map((notification) => (
                        <button key={notification.id} className="admin-dropdown-item" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{notification.title}</p>
                            <p className="text-xs text-slate-400">{notification.message}</p>
                            <p className="text-xs text-slate-500 mt-1">{notification.time}</p>
                          </div>
                          {!notification.read && <span className="admin-notification-badge" style={{ position: 'relative', top: '0.25rem' }}></span>}
                        </button>
                      ))}
                      <div className="admin-dropdown-divider"></div>
                      <button className="admin-dropdown-item text-center justify-center" style={{ color: 'rgb(var(--tr-blue))' }}>
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
                <div className="relative" ref={messagesRef}>
                  <button
                    className="admin-header-btn"
                    aria-label="Messages"
                    onClick={() => { setMessagesOpen(!messagesOpen); setNotificationsOpen(false); }}
                  >
                    <Mail className="h-5 w-5" />
                    <span className="admin-messages-badge">3</span>
                  </button>
                  {messagesOpen && (
                    <div className="admin-dropdown open" style={{ right: 0, minWidth: '20rem', maxHeight: '24rem', overflowY: 'auto' }}>
                      <div className="px-3 py-2 border-b border-slate-700">
                        <p className="text-sm font-semibold text-white">Messages</p>
                      </div>
                      {MESSAGES.map((message) => (
                        <button key={message.id} className="admin-dropdown-item" style={{ justifyContent: 'flex-start', alignItems: 'flex-start', gap: '0.75rem' }}>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium text-white">{message.sender}</p>
                            <p className="text-xs text-slate-400">{message.subject}</p>
                            <p className="text-xs text-slate-500 mt-1">{message.time}</p>
                          </div>
                          {message.unread && <span className="admin-notification-badge" style={{ position: 'relative', top: '0.25rem' }}></span>}
                        </button>
                      ))}
                      <div className="admin-dropdown-divider"></div>
                      <button className="admin-dropdown-item text-center justify-center" style={{ color: 'rgb(var(--tr-blue))' }}>
                        View all messages
                      </button>
                    </div>
                  )}
                </div>
                <div className="admin-user-profile" ref={dropdownRef} onClick={() => { setDropdownOpen(!dropdownOpen); setNotificationsOpen(false); setMessagesOpen(false); }}>
                  <div className="hidden sm:block text-right">
                    <p className="admin-user-name">
                      {user?.firstName || 'Admin'} {user?.lastName || 'User'}
                    </p>
                    <p className="admin-user-role">{user?.role || 'Administrator'}</p>
                  </div>
                  <div className="admin-user-avatar">
                    {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'A'}
                  </div>
                  <ChevronDown className="h-4 w-4 hidden sm:block" style={{ color: 'rgb(var(--tr-text-muted))' }} />
                  {dropdownOpen && (
                    <div className="admin-dropdown open">
                      <button className="admin-dropdown-item" onClick={() => { navigate('/admin/profile'); setDropdownOpen(false); }}>
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button className="admin-dropdown-item" onClick={() => { navigate('/admin/settings'); setDropdownOpen(false); }}>
                        <Settings className="w-4 h-4" /> Settings
                      </button>
                      <button className="admin-dropdown-item" onClick={() => { navigate('/admin/help'); setDropdownOpen(false); }}>
                        <HelpCircle className="w-4 h-4" /> Help & Support
                      </button>
                      <div className="admin-dropdown-divider"></div>
                      <button className="admin-dropdown-item" onClick={handleLogout} style={{ color: 'rgb(var(--tr-danger))' }}>
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="admin-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;
