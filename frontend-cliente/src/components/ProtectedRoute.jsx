import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';

export function ProtectedRoute({ children }) {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
