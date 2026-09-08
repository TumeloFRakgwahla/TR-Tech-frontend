import React, { createContext, useContext, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Search, Menu } from 'lucide-react';

export const SidebarContext = createContext();

const NAV_GROUPS = [
  {
    id: 'main',
    label: null,
    items: [
      { path: '/admin', icon: 'layout-dashboard', label: 'Dashboard' },
    ],
  },
  {
    id: 'storefront',
    label: 'Storefront',
    items: [
      { path: '/admin/products', icon: 'package', label: 'Products' },
      { path: '/admin/services', icon: 'wrench', label: 'Services' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { path: '/admin/repairs', icon: 'smartphone', label: 'Repairs' },
      { path: '/admin/orders', icon: 'shopping-cart', label: 'Orders' },
      { path: '/admin/customers', icon: 'users', label: 'Customers' },
      { path: '/admin/inventory', icon: 'warehouse', label: 'Inventory' },
    ],
  },
  {
    id: 'insights',
    label: 'Insights',
    items: [
      { path: '/admin/marketing', icon: 'megaphone', label: 'Marketing' },
      { path: '/admin/reports', icon: 'bar-chart-3', label: 'Reports' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    items: [
      { path: '/admin/users', icon: 'user-cog', label: 'User Management' },
    ],
  },
];

const FOOTER_ITEMS = [
  { path: '/admin/settings', icon: 'settings', label: 'Settings' },
  { path: '/admin/help', icon: 'help-circle', label: 'Help & Support' },
  { path: '/admin/profile', icon: 'user', label: 'Admin Profile' },
];

const ICON_MAP = {
  'layout-dashboard': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  'package': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  'tags': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  'building-2': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  'wrench': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  'smartphone': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>,
  'shopping-cart': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  'users': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  'warehouse': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>,
  'megaphone': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>,
  'bar-chart-3': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  'user-cog': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  'settings': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  'help-circle': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  'user': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  'log-out': ({ className }) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
};

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem('trtech_sidebar_collapsed');
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSidebar = useCallback(() => setIsOpen(prev => !prev), []);
  const toggleCollapsed = useCallback(() => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('trtech_sidebar_collapsed', JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }, []);
  const toggleSection = useCallback((sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  }, []);

  return (
    <SidebarContext.Provider value={{
      isOpen, setIsOpen, toggleSidebar,
      isCollapsed, setIsCollapsed, toggleCollapsed,
      searchQuery, setSearchQuery,
      expandedSections, toggleSection,
    }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, className = '' }) => {
  const { isOpen, isCollapsed, toggleSidebar, toggleCollapsed } = useContext(SidebarContext);

  return (
    <>
      <div
        className={`transition-all duration-300 fixed inset-y-0 left-0 admin-z-sidebar shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:z-50 md:flex md:flex-col ${
          isCollapsed ? 'w-16' : 'w-64'
        } ${className}`}
      >
        <div className="flex flex-col h-full">
          {children}
        </div>
        <button
          onClick={toggleCollapsed}
          className="admin-collapse-toggle"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!isOpen && (
        <div
          className={`admin-mobile-overlay ${!isOpen ? 'active' : ''} md:hidden`}
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export const SidebarContent = ({ children }) => (
  <div className="py-2 flex-1 overflow-y-auto scrollbar-hide">
    {children}
  </div>
);

export const SidebarHeader = ({ children }) => (
  <div className="mb-2">{children}</div>
);

export const SidebarGroup = ({ children, label, sectionId, collapsible = true }) => {
  const { isCollapsed, expandedSections, toggleSection } = useContext(SidebarContext);
  const [isOpen] = useState(true);

  if (isCollapsed) {
    return <div className="space-y-1">{children}</div>;
  }

  const isSectionOpen = expandedSections[sectionId] !== false;

  return (
    <div className="admin-sidebar-section">
      {label && collapsible && (
        <button
          onClick={() => toggleSection(sectionId)}
          className="admin-sidebar-section-label"
        >
          <span>{label}</span>
          <ChevronLeft className={`admin-sidebar-section-chevron ${isSectionOpen ? 'open' : ''}`} />
        </button>
      )}
      {(!collapsible || isSectionOpen) && <div className="space-y-0.5">{children}</div>}
    </div>
  );
};

export const SidebarMenu = ({ children }) => (
  <ul className="admin-nav-list">
    {children}
  </ul>
);

export const SidebarMenuItem = ({ children, tooltip }) => {
  const { isCollapsed } = useContext(SidebarContext);

  if (isCollapsed && tooltip) {
    return (
      <li className="relative group">
        {children}
        <span className="admin-sidebar-tooltip">
          {tooltip}
        </span>
      </li>
    );
  }

  return <li>{children}</li>;
};

const renderIcon = (iconName, className) => {
  const IconComponent = ICON_MAP[iconName];
  if (IconComponent) {
    return <IconComponent className={className} />;
  }
  return null;
};

export const SidebarMenuButton = ({ children, isActive, onClick, icon, badge }) => {
  const { isCollapsed } = useContext(SidebarContext);
  const textChild = typeof children === 'string' ? children : '';

  return (
    <button
      onClick={onClick}
      className={`admin-nav-item ${
        isActive
          ? 'admin-nav-item-active'
          : 'admin-nav-item-inactive'
      }`}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" style={{ backgroundColor: 'rgb(var(--tr-blue))' }} />
      )}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && (
          <span className="admin-nav-item-icon">
            {renderIcon(icon, 'w-5 h-5')}
          </span>
        )}
        {!isCollapsed && textChild && (
          <span className="truncate text-sm">{textChild}</span>
        )}
      </div>
      {!isCollapsed && badge && (
        <span className="ml-auto bg-slate-700 text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
};

export const SidebarSubmenu = ({ items, activePath }) => {
  const { isCollapsed } = useContext(SidebarContext);

  if (isCollapsed) return null;

  return (
    <ul className="admin-nav-submenu">
      {items.map((item) => (
        <li key={item.path}>
          <button
            onClick={() => window.location.href = item.path}
            className={`admin-nav-submenu-item ${activePath === item.path ? 'admin-nav-submenu-item-active' : ''}`}
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
};

export const SidebarTrigger = () => {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors md:hidden"
      aria-label="Toggle sidebar"
    >
      <Menu className="w-5 h-5" />
    </button>
  );
};

export const SidebarFooter = ({ children }) => (
  <div className="admin-sidebar-footer">
    {children}
  </div>
);

export const SidebarSearch = () => {
  const { searchQuery, setSearchQuery, isCollapsed } = useContext(SidebarContext);

  if (isCollapsed) return null;

  return (
    <div className="mb-4 px-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Jump to..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-input w-full pl-9 pr-3 py-2 text-sm"
        />
      </div>
    </div>
  );
};

export const SidebarInset = ({ children }) => (
  <div className="flex-1 bg-slate-900">
    {children}
  </div>
);

export { NAV_GROUPS, FOOTER_ITEMS, ICON_MAP };
