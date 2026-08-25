import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { adminAuthAPI } from '../services/api';
import { clearCsrfCache } from '../services/api';
import { toast } from 'sonner';

const AdminAuthContext = createContext(undefined);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const justLoggedOut = useRef(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('trtech:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('trtech:unauthorized', handleUnauthorized);
  }, []);

  const checkAuth = useCallback(async () => {
    if (justLoggedOut.current) {
      justLoggedOut.current = false;
      setLoading(false);
      return;
    }
    try {
      const data = await adminAuthAPI.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await adminAuthAPI.login({ email, password });
      setUser(data.user);
      toast.success('Admin login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Admin login failed');
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    justLoggedOut.current = true;
    clearCsrfCache();
    try {
      await adminAuthAPI.logout();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      isAuthenticated: !!user,
    }),
    [user, loading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: () => {},
      logout: () => {},
      isAuthenticated: false,
    };
  }
  return context;
}
