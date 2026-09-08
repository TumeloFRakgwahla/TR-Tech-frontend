import { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { USER_ROLES, DEFAULT_ROLE_PERMISSIONS, PERMISSIONS } from '../constants';

const AdminPermissionsContext = createContext(null);

export function AdminPermissionsProvider({ children }) {
  const [userRoles, setUserRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('trtech_user_roles');
      return stored ? JSON.parse(stored) : DEFAULT_ROLE_PERMISSIONS;
    } catch {
      return DEFAULT_ROLE_PERMISSIONS;
    }
  });

  const [activityLogs, setActivityLogs] = useState([]);

  const saveRoles = useCallback((roles) => {
    setUserRoles(roles);
    try {
      localStorage.setItem('trtech_user_roles', JSON.stringify(roles));
    } catch {
      // Storage unavailable
    }
  }, []);

  const getRolePermissions = useCallback((roleId) => {
    return userRoles[roleId] || [];
  }, [userRoles]);

  const hasPermission = useCallback((userRole, permission) => {
    const permissions = userRoles[userRole] || [];
    return permissions.includes(permission);
  }, [userRoles]);

  const addPermissionToRole = useCallback((roleId, permission) => {
    setUserRoles(prev => {
      const next = { ...prev, [roleId]: [...(prev[roleId] || []), permission] };
      try {
        localStorage.setItem('trtech_user_roles', JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }, []);

  const removePermissionFromRole = useCallback((roleId, permission) => {
    setUserRoles(prev => {
      const next = { ...prev, [roleId]: (prev[roleId] || []).filter(p => p !== permission) };
      try {
        localStorage.setItem('trtech_user_roles', JSON.stringify(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }, []);

  const updateRolePermissions = useCallback((roleId, permissions) => {
    saveRoles({ ...userRoles, [roleId]: permissions });
  }, [userRoles, saveRoles]);

  const addLog = useCallback((action, details = {}) => {
    const log = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      action,
      details,
      timestamp: new Date().toISOString(),
      ip: details.ip || '127.0.0.1',
      userAgent: details.userAgent || navigator.userAgent,
    };
    setActivityLogs(prev => [log, ...prev].slice(0, 500));
    return log;
  }, []);

  const value = useMemo(() => ({
    userRoles,
    activityLogs,
    getRolePermissions,
    hasPermission,
    addPermissionToRole,
    removePermissionFromRole,
    updateRolePermissions,
    saveRoles,
    addLog,
    availablePermissions: PERMISSIONS,
    availableRoles: USER_ROLES,
  }), [userRoles, activityLogs, getRolePermissions, hasPermission, addPermissionToRole, removePermissionFromRole, updateRolePermissions, saveRoles, addLog]);

  return (
    <AdminPermissionsContext.Provider value={value}>
      {children}
    </AdminPermissionsContext.Provider>
  );
}

export function useAdminPermissions() {
  const context = useContext(AdminPermissionsContext);
  if (!context) {
    return {
      userRoles: DEFAULT_ROLE_PERMISSIONS,
      activityLogs: [],
      getRolePermissions: () => [],
      hasPermission: () => false,
      addPermissionToRole: () => {},
      removePermissionFromRole: () => {},
      updateRolePermissions: () => {},
      saveRoles: () => {},
      addLog: () => {},
      availablePermissions: PERMISSIONS,
      availableRoles: USER_ROLES,
    };
  }
  return context;
}

export { AdminPermissionsContext };
