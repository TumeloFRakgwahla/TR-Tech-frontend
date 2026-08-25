import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../components/AdminAuthContext';

export function AdminProtectedRoute({ children, redirectTo = '/admin/login' }) {
  const { isAuthenticated, user, loading } = useAdminAuth();

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

  if (user?.role !== 'admin') {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
