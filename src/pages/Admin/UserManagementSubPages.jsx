import { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';
import { Label } from '../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Search,
  Edit,
  Trash2,
  User,
  KeyRound,
  Plus,
  Shield,
  Activity,
  UserCog,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../../services/api';
import { useAdminPermissions } from '../../contexts/AdminPermissionsContext';
import { Skeleton } from '../../components/Skeleton';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import { USER_ROLES } from '../../constants';
import { cn } from '../../lib/utils';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';

const SUBMENU_ITEMS = [
  { path: '/admin/users', label: 'All Users', icon: User, exact: true },
  { path: '/admin/users/add', label: 'Add User', icon: Plus },
  { path: '/admin/users/roles', label: 'Roles & Permissions', icon: Shield },
  { path: '/admin/users/admins', label: 'Admin Users', icon: UserCog },
  { path: '/admin/users/logs', label: 'Activity Logs', icon: Activity },
];

export default function UserManagement() {
  const location = useLocation();
  const { addLog } = useAdminPermissions();

  const currentPath = location.pathname;
  const activeItem = SUBMENU_ITEMS.find(item => item.exact ? currentPath === item.path : currentPath.startsWith(item.path)) || SUBMENU_ITEMS[0];

  const renderSubPage = () => {
    switch (activeItem.path) {
      case '/admin/users/add':
        return <AddUserPage onLog={addLog} />;
      case '/admin/users/roles':
        return <RolesPermissionsPage />;
      case '/admin/users/admins':
        return <AdminUsersPage onLog={addLog} />;
      case '/admin/users/logs':
        return <ActivityLogsPage />;
      case '/admin/users':
      default:
        return <AllUsersPage onLog={addLog} />;
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
            User Management
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--tr-text-muted))' }}>
            Manage user accounts, roles, permissions, and activity
          </p>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {SUBMENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact ? currentPath === item.path : currentPath.startsWith(item.path);
          return (
            <Link key={item.path} to={item.path}>
              <button
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200',
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
                {isActive && <ChevronRight className="w-3 h-3 ml-1" />}
              </button>
            </Link>
          );
        })}
      </div>

      {renderSubPage()}
    </div>
  );
}

function AllUsersPage({ onLog }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetError, setResetError] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await usersAPI.getAll({ limit: 100 });
        if (isMounted) setUsers(res.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load users');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadUsers();
    return () => { isMounted = false; };
  }, []);

  const filteredUsers = users.filter((user) => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (resetPasswordValue.length < 8) {
      setResetError('Password must be at least 8 characters');
      return;
    }
    if (resetPasswordValue !== resetConfirm) {
      setResetError('Passwords do not match');
      return;
    }
    setResetError(null);
    setResetLoading(true);
    try {
      await usersAPI.resetPassword(resetTarget._id || resetTarget.id, resetPasswordValue);
      toast.success('Password reset successfully');
      onLog?.('user.password_reset', { userId: resetTarget._id || resetTarget.id, email: resetTarget.email });
      setResetDialogOpen(false);
      setResetPasswordValue('');
      setResetConfirm('');
    } catch (e) {
      setResetError(e.message || 'Failed to reset password');
    } finally {
      setResetLoading(false);
    }
   };

   const confirmDeleteUser = (user) => {
     setDeleteTargetId(user._id || user.id);
     setDeleteDialogOpen(true);
   };

    const handleConfirmDeleteUser = async () => {
      if (!deleteTargetId) return;
      try {
        await usersAPI.delete(deleteTargetId);
        toast.success('User deleted');
        onLog?.('user.deleted', { userId: deleteTargetId });
        setUsers(users.filter((u) => (u._id || u.id) !== deleteTargetId));
      } catch { toast.error('Delete failed'); }
      setDeleteDialogOpen(false);
      setDeleteTargetId(null);
    };

    if (isLoading) {
    return (
      <div className="admin-section-card">
        <div className="admin-section-body">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <AdminErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">All Users</h2>
          <p className="admin-section-description">{filteredUsers.length} user accounts</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--tr-text-muted))' }} />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-header-search"
            style={{ maxWidth: '20rem' }}
          />
        </div>
      </div>
      <div className="admin-section-body" style={{ paddingTop: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'rgb(var(--tr-text-muted))' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--tr-blue-bg))', color: 'rgb(var(--tr-blue))' }}>
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs" style={{ color: 'rgb(var(--tr-text-muted))' }}>ID: {String(user._id || user.id).slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>{user.email}</td>
                    <td>
                      <span className="admin-badge admin-badge-blue">{user.role || 'Customer'}</span>
                    </td>
                    <td>
                      <StatusBadge status={user.isActive !== false ? 'Active' : 'Inactive'} type="user" size="sm" />
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="admin-header-btn"
                          style={{ width: 'auto', padding: '0.375rem' }}
                          title="Edit user"
                          onClick={() => toast.info('Edit user form coming soon')}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="admin-header-btn"
                          style={{ width: 'auto', padding: '0.375rem', color: 'rgb(var(--tr-warning))' }}
                          onClick={() => { setResetTarget(user); setResetPasswordValue(''); setResetConfirm(''); setResetError(null); setResetDialogOpen(true); }}
                          title="Reset password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                        <button
                          className="admin-header-btn"
                          style={{ width: 'auto', padding: '0.375rem', color: 'rgb(var(--tr-danger))' }}
                          onClick={() => confirmDeleteUser(user)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="admin-section-card" style={{ border: '1px solid rgb(var(--tr-border))' }}>
          <DialogHeader>
            <DialogTitle className="text-white">
              Reset password{resetTarget ? ` for ${resetTarget.firstName} ${resetTarget.lastName}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">New password</Label>
              <Input
                type="password"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                placeholder="At least 8 characters"
                className="admin-input"
              />
            </div>
            <div>
              <Label className="text-white">Confirm password</Label>
              <Input
                type="password"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="admin-input"
              />
            </div>
            {resetError && <p className="text-sm" style={{ color: 'rgb(var(--tr-danger))' }}>{resetError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
            <Button onClick={handleResetPassword} disabled={resetLoading} className="bg-blue-600 hover:bg-blue-700">
              {resetLoading ? 'Resetting...' : 'Reset password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteUser}
        variant="destructive"
      />
    </div>
  );
}

function AddUserPage({ onLog }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { confirmPassword: _confirmPassword, ...submitData } = formData;
      await usersAPI.create(submitData);
      toast.success('User created successfully');
      onLog?.('user.created', { email: submitData.email, role: submitData.role });
      setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'customer', isActive: true });
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Add New User</h2>
          <p className="admin-section-description">Create a new user account</p>
        </div>
      </div>
      <div className="admin-section-body">
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: 'rgb(var(--tr-danger-bg))', color: 'rgb(var(--tr-danger))' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4" style={{ maxWidth: '32rem' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">First name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="John"
                className="admin-input"
                required
              />
            </div>
            <div>
              <Label className="text-white">Last name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Doe"
                className="admin-input"
                required
              />
            </div>
          </div>
          <div>
            <Label className="text-white">Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="admin-input"
              required
            />
          </div>
          <div>
            <Label className="text-white">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger className="admin-input">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent className="admin-section-card" style={{ border: '1px solid rgb(var(--tr-border))' }}>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.id} value={role.id}>{role.label} — {role.description}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-white">Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Min. 8 characters"
              className="admin-input"
              required
            />
          </div>
          <div>
            <Label className="text-white">Confirm password</Label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Re-enter password"
              className="admin-input"
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
            <Link to="/admin/users">
              <Button type="button" variant="outline" className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function RolesPermissionsPage() {
  const { userRoles, updateRolePermissions, availablePermissions, availableRoles, addLog } = useAdminPermissions();
  const [selectedRole, setSelectedRole] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteRoleDialogOpen, setDeleteRoleDialogOpen] = useState(false);
  const [deleteRoleTargetId, setDeleteRoleTargetId] = useState(null);
  const [createRoleOpen, setCreateRoleOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const rolePermissions = selectedRole ? userRoles[selectedRole] || [] : [];

  const togglePermission = (permission) => {
    if (!selectedRole) return;
    const current = userRoles[selectedRole] || [];
    const next = current.includes(permission)
      ? current.filter(p => p !== permission)
      : [...current, permission];
    updateRolePermissions(selectedRole, next);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setIsSaving(true);
    try {
      await usersAPI.updateRole(selectedRole, { permissions: userRoles[selectedRole] });
      toast.success('Role permissions updated');
      addLog?.('role.updated', { roleId: selectedRole, permissions: userRoles[selectedRole] });
    } catch {
      toast.error('Failed to update role');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    setIsSaving(true);
    try {
      const newRole = await usersAPI.createRole({ name: newRoleName.trim(), permissions: [] });
      toast.success('Role created');
      addLog?.('role.created', { roleId: newRole._id, name: newRoleName.trim() });
      setNewRoleName('');
      setCreateRoleOpen(false);
    } catch {
      toast.error('Failed to create role');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDeleteRole = (roleId) => {
    setDeleteRoleTargetId(roleId);
    setDeleteRoleDialogOpen(true);
  };

  const handleConfirmDeleteRole = async () => {
    if (!deleteRoleTargetId) return;
    try {
      await usersAPI.deleteRole(deleteRoleTargetId);
      toast.success('Role deleted');
      addLog?.('role.deleted', { roleId: deleteRoleTargetId });
      setSelectedRole(prev => prev === deleteRoleTargetId ? null : prev);
    } catch { toast.error('Failed to delete role'); }
    setDeleteRoleDialogOpen(false);
    setDeleteRoleTargetId(null);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="admin-section-card">
          <div className="admin-section-header">
            <h2 className="admin-section-title">Roles</h2>
            <Button size="sm" onClick={() => setCreateRoleOpen(true)} className="bg-blue-600 hover:bg-blue-700" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </div>
          <div className="admin-section-body" style={{ paddingTop: 0 }}>
            <div className="space-y-1">
              {availableRoles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200',
                    selectedRole === role.id
                      ? 'bg-blue-600/10 border border-blue-600/20'
                      : 'hover:bg-slate-800/50 border border-transparent'
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-white">{role.label}</p>
                    <p className="text-xs" style={{ color: 'rgb(var(--tr-text-muted))' }}>{role.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgb(var(--tr-navy-lighter))', color: 'rgb(var(--tr-text-muted))' }}>
                      {(userRoles[role.id] || []).length} perms
                    </span>
                    {role.id !== 'admin' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); confirmDeleteRole(role.id); }}
                        className="p-1 rounded hover:bg-red-600/10"
                        style={{ color: 'rgb(var(--tr-danger))' }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="admin-section-card">
          <div className="admin-section-header">
            <div>
              <h2 className="admin-section-title">
                {selectedRole ? `${availableRoles.find(r => r.id === selectedRole)?.label} Permissions` : 'Select a Role'}
              </h2>
              <p className="admin-section-description">
                {selectedRole ? `${rolePermissions.length} of ${Object.keys(availablePermissions).length} permissions enabled` : 'Choose a role from the left to manage its permissions'}
              </p>
            </div>
            {selectedRole && (
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            )}
          </div>
          <div className="admin-section-body">
            {!selectedRole ? (
              <div className="text-center py-12" style={{ color: 'rgb(var(--tr-text-muted))' }}>
                <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a role to view and edit its permissions</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {Object.entries(availablePermissions).map(([key, perm]) => {
                  const enabled = rolePermissions.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => togglePermission(key)}
                      className={cn(
                        'flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left',
                        enabled
                          ? 'border-blue-600/30 bg-blue-600/5'
                          : 'border-slate-700 hover:border-slate-600'
                      )}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{perm.label}</p>
                        <p className="text-xs" style={{ color: 'rgb(var(--tr-text-muted))' }}>{perm.description}</p>
                      </div>
                      <div className={cn(
                        'w-5 h-5 rounded flex items-center justify-center transition-all',
                        enabled ? 'bg-blue-600' : 'border border-slate-600'
                      )}>
                        {enabled && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-white">Role name</Label>
              <Input
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="e.g. editor"
                className="bg-slate-700 border-slate-600 text-white"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateRole();
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateRoleOpen(false)} className="border-slate-600 text-white hover:bg-slate-700">Cancel</Button>
            <Button onClick={handleCreateRole} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
              {isSaving ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteRoleDialogOpen}
        onOpenChange={setDeleteRoleDialogOpen}
        title="Delete Role"
        description="Are you sure you want to delete this role? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleConfirmDeleteRole}
        variant="destructive"
      />
    </div>
  );
}

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loadAdmins = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await usersAPI.getAdmins();
        if (isMounted) setUsers(res.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load admin users');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadAdmins();
    return () => { isMounted = false; };
  }, []);

  if (isLoading) {
    return (
      <div className="admin-section-card">
        <div className="admin-section-body">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <AdminErrorState error={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Admin Users</h2>
          <p className="admin-section-description">Users with administrative access</p>
        </div>
      </div>
      <div className="admin-section-body" style={{ paddingTop: 0 }}>
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'rgb(var(--tr-text-muted))' }}>
                    No admin users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id || user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--tr-blue-bg))', color: 'rgb(var(--tr-blue))' }}>
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{user.firstName} {user.lastName}</p>
                          <p className="text-xs" style={{ color: 'rgb(var(--tr-text-muted))' }}>ID: {String(user._id || user.id).slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>{user.email}</td>
                    <td>
                      <span className="admin-badge admin-badge-blue">{user.role || 'Admin'}</span>
                    </td>
                    <td>
                      <StatusBadge status={user.isActive !== false ? 'Active' : 'Inactive'} type="user" size="sm" />
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ActivityLogsPage() {
  const { activityLogs } = useAdminPermissions();
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    let logs = activityLogs;
    if (filter !== 'all') {
      logs = logs.filter(log => log.action === filter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      logs = logs.filter(log =>
        log.action.toLowerCase().includes(q) ||
        JSON.stringify(log.details).toLowerCase().includes(q)
      );
    }
    return logs;
  }, [activityLogs, filter, searchQuery]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionLabel = (action) => {
    return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActionColor = (action) => {
    if (action.includes('created')) return 'admin-badge-success';
    if (action.includes('deleted')) return 'admin-badge-danger';
    if (action.includes('updated')) return 'admin-badge-info';
    if (action.includes('login')) return 'admin-badge-blue';
    if (action.includes('logout')) return 'admin-badge-neutral';
    return 'admin-badge-neutral';
  };

  return (
    <div className="admin-section-card">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Activity Logs</h2>
          <p className="admin-section-description">{filteredLogs.length} log entries</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="admin-input"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.8125rem' }}
          >
            <option value="all">All Actions</option>
            {['user.created', 'user.updated', 'user.deleted', 'user.password_reset', 'role.created', 'role.updated', 'role.deleted', 'login', 'logout', 'settings.updated'].map(action => (
              <option key={action} value={action}>{getActionLabel(action)}</option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--tr-text-muted))' }} />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-header-search"
              style={{ maxWidth: '16rem' }}
            />
          </div>
        </div>
      </div>
      <div className="admin-section-body" style={{ paddingTop: 0 }}>
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'rgb(var(--tr-text-muted))' }}>
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No activity logs yet</p>
            <p className="text-xs mt-1">Activity will appear here as actions are performed</p>
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Timestamp</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <span className={cn('admin-badge', getActionColor(log.action))}>
                        {getActionLabel(log.action)}
                      </span>
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))', maxWidth: '24rem' }}>
                      <span className="truncate block">{JSON.stringify(log.details)}</span>
                    </td>
                    <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>{formatTimestamp(log.timestamp)}</td>
                    <td style={{ color: 'rgb(var(--tr-text-muted))' }}>{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
