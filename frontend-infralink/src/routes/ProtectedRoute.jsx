import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';
import { ROUTES } from '../constants/routes.js';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // If user is logged in but has no role assigned, force them to select one
  // Exclude the role selection page itself to avoid infinite redirect loops
  const hasNoRole = !user?.role || user?.role === 'unassigned';
  if (hasNoRole && location.pathname !== ROUTES.ROLE_SELECT) {
    return <Navigate to={ROUTES.ROLE_SELECT} replace />;
  }

  return <Outlet />;
}

