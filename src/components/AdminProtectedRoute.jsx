import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../components/AdminAuthContext';
import { useAdminPermissions } from '../contexts/AdminPermissionsContext';
import Seo from '../components/Seo';

export function AdminProtectedRoute({ children, redirectTo = '/admin/login', requiredPermission }) {
  const { isAuthenticated, user, loading } = useAdminAuth();
  const { hasPermission } = useAdminPermissions();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  const allowedRoles = ['admin', 'manager', 'staff'];
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredPermission && !hasPermission(user?.role, requiredPermission)) {
    return <Navigate to="/admin" replace />;
  }

  // Admin pages are behind auth — noindex to prevent crawling by search
  // engines that might hit the auth-gated SPA shell
  return (
    <>
      <Seo noindex title="Admin — TR-Tech" />
      {children}
    </>
  );
}
