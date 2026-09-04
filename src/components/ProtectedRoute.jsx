import { Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import Seo from '../components/Seo';

export function ProtectedRoute({ children, requiredRole, redirectTo = '/admin/login' }) {
  const { isAuthenticated, user, loading } = useAuth();

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

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={redirectTo} replace />;
  }

  // Account pages are behind auth — noindex to prevent crawling by search
  // engines that might hit the auth-gated SPA shell
  return (
    <>
      <Seo noindex title="Account — TR-Tech" />
      {children}
    </>
  );
}
