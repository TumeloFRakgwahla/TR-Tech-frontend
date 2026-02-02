import React, { createContext, useContext, useState } from 'react';

// Create a simple sidebar context
const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({ children, className = '' }) => {
  const { isOpen } = useContext(SidebarContext);

  return (
    <div className={`bg-slate-900 text-white w-64 h-screen transition-all duration-300 fixed md:relative z-50 shadow-lg ${isOpen ? 'block' : 'hidden'} md:block flex flex-col ${className}`}>
      <div className="flex flex-col h-full">
        {children}
      </div>
    </div>
  );
};

export const SidebarContent = ({ children }) => (
  <div className="p-4 flex-1">
    {children}
  </div>
);

export const SidebarHeader = ({ children }) => (
  <div className="mb-4">
    {children}
  </div>
);

export const SidebarMenu = ({ children }) => (
  <ul className="space-y-2">
    {children}
  </ul>
);

export const SidebarMenuItem = ({ children }) => (
  <li>
    {children}
  </li>
);

export const SidebarMenuButton = ({ children, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-lg hover:bg-slate-800 transition-all duration-200 flex items-center ${
      isActive ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
    }`}
  >
    {children}
  </button>
);

export const SidebarTrigger = () => {
  const { toggleSidebar } = useContext(SidebarContext);

  return (
    <button
      onClick={toggleSidebar}
      className="p-2 bg-gray-200 rounded md:hidden"
    >
      ☰
    </button>
  );
};

export const SidebarFooter = ({ children }) => (
  <div className="p-4 border-t border-slate-700">
    {children}
  </div>
);

export const SidebarInset = ({ children }) => (
  <div className="flex-1 bg-slate-50">
    {children}
  </div>
);