import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function ProtectedAdminRoute({ children }) {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useAuthStore((s) => !!s.user?.is_cafeteria_admin);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" state={{ error: 'no-admin' }} replace />;
  }

  return children;
}
