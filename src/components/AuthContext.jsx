import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'sonner';
import { clearCsrfCache } from '../services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
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
      const data = await authAPI.getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      setUser(data.user);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      const data = await authAPI.register(userData);
      setUser(data.user);
      if (data.user?.emailVerified === false) {
        if (data.verificationUrl) {
          toast(
            () => (
              <div className="flex flex-col gap-1">
                <p>Registration successful! Your email needs verification.</p>
                <a href={data.verificationUrl} className="underline text-sm">
                  Click here to verify your email (dev link)
                </a>
              </div>
            ),
            { duration: 15000 }
          );
        } else {
          toast.success('Registration successful! Check your email to verify your address.');
        }
      } else {
        toast.success('Registration successful!');
      }
      return { success: true, user: data.user };
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  }, []);

  const logout = useCallback(async () => {
    justLoggedOut.current = true;
    clearCsrfCache();
    try {
      await authAPI.logout();
    } catch {
      // ignore logout errors
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
    }
  }, []);

  const updateUser = useCallback((userData) => {
    setUser((prev) => (prev ? { ...prev, ...userData } : null));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: !!user,
    }),
    [user, loading, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      loading: false,
      login: async () => ({ success: false, error: 'Auth context not available' }),
      register: async () => ({ success: false, error: 'Auth context not available' }),
      logout: () => {},
      updateUser: () => {},
      isAuthenticated: false,
    };
  }
  return context;
}
