import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { role, isAuthenticated, isLoading } = useAuth();

  // While checking auth status, we can show a loader or nothing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-400 italic animate-pulse">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user is logged in but doesn't have required role
    const fallbackPath = role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
