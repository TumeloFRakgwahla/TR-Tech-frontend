import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { authAPI, ordersAPI, accountAPI, repairsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const AccountContext = createContext(undefined);

export function AccountProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [notifications, setNotifications] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const fetchProfile = useCallback(async () => {
    try {
      const data = await authAPI.getMe();
      setProfile(data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  }, []);

  const fetchAddresses = useCallback(async () => {
    try {
      const data = await accountAPI.getAddresses();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await ordersAPI.myOrders({ limit: 50 });
      setOrders(data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
  }, []);

  const fetchRepairs = useCallback(async () => {
    try {
      const data = await repairsAPI.myRepairs({ limit: 50 });
      setRepairs(data.data || []);
    } catch (error) {
      console.error('Failed to fetch repairs:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await accountAPI.getNotifications();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const data = await accountAPI.getSessions();
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    }
  }, []);

  const initializeAccount = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    await Promise.allSettled([
      fetchProfile(),
      fetchAddresses(),
      fetchOrders(),
      fetchRepairs(),
      fetchNotifications(),
      fetchSessions(),
    ]);
    setLoading(false);
  }, [isAuthenticated, fetchProfile, fetchAddresses, fetchOrders, fetchRepairs, fetchNotifications, fetchSessions]);

  useEffect(() => {
    initializeAccount();
  }, [initializeAccount]);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const data = await accountAPI.updateProfile(profileData);
      setProfile(data.data);
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      return { success: false, error: error.message };
    }
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      await accountAPI.changePassword({ currentPassword, newPassword });
      toast.success('Password changed successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      return { success: false, error: error.message };
    }
  }, []);

  const addAddress = useCallback(async (addressData) => {
    try {
      const data = await accountAPI.createAddress(addressData);
      setAddresses((prev) => [...prev, data.data]);
      toast.success('Address added successfully');
      return { success: true, data: data.data };
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
      return { success: false, error: error.message };
    }
  }, []);

  const updateAddress = useCallback(async (id, addressData) => {
    try {
      const data = await accountAPI.updateAddress(id, addressData);
      setAddresses((prev) => prev.map((a) => (a._id === id ? data.data : a)));
      toast.success('Address updated successfully');
      return { success: true, data: data.data };
    } catch (error) {
      toast.error(error.message || 'Failed to update address');
      return { success: false, error: error.message };
    }
  }, []);

  const deleteAddress = useCallback(async (id) => {
    try {
      await accountAPI.deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a._id !== id));
      toast.success('Address deleted successfully');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to delete address');
      return { success: false, error: error.message };
    }
  }, []);

  const setDefaultAddress = useCallback(async (id) => {
    try {
      await accountAPI.setDefaultAddress(id);
      setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a._id === id })));
      toast.success('Default address updated');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to set default address');
      return { success: false, error: error.message };
    }
  }, []);

  const updateNotificationPreferences = useCallback(async (prefs) => {
    try {
      const data = await accountAPI.updateNotifications(prefs);
      setNotifications(data.data);
      toast.success('Notification preferences updated');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to update preferences');
      return { success: false, error: error.message };
    }
  }, []);

  const revokeSession = useCallback(async (sessionId) => {
    try {
      await accountAPI.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));
      toast.success('Session revoked');
      return { success: true };
    } catch (error) {
      toast.error(error.message || 'Failed to revoke session');
      return { success: false, error: error.message };
    }
  }, []);

  const value = useMemo(
    () => ({
      profile,
      addresses,
      orders,
      repairs,
      notifications,
      sessions,
      loading,
      initializeAccount,
      updateProfile,
      changePassword,
      addAddress,
      updateAddress,
      deleteAddress,
      setDefaultAddress,
      updateNotificationPreferences,
      revokeSession,
      refreshOrders: fetchOrders,
      refreshRepairs: fetchRepairs,
    }),
    [profile, addresses, orders, repairs, notifications, sessions, loading, initializeAccount, fetchOrders, fetchRepairs, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress, updateNotificationPreferences, revokeSession]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) {
    return {
      profile: null,
      addresses: [],
      orders: [],
      repairs: [],
      notifications: null,
      sessions: [],
      loading: true,
      initializeAccount: async () => {},
      updateProfile: async () => ({ success: false }),
      changePassword: async () => ({ success: false }),
      addAddress: async () => ({ success: false }),
      updateAddress: async () => ({ success: false }),
      deleteAddress: async () => ({ success: false }),
      setDefaultAddress: async () => ({ success: false }),
      updateNotificationPreferences: async () => ({ success: false }),
      revokeSession: async () => ({ success: false }),
      refreshOrders: async () => {},
      refreshRepairs: async () => {},
    };
  }
  return context;
}
