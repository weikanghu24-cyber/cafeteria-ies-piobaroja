import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { OrderDetailPage } from './pages/admin/OrderDetailPage';
import { ScannerPage } from './pages/admin/ScannerPage';
import { ProductsPage } from './pages/admin/ProductsPage';
import { TimeslotsPage } from './pages/admin/TimeslotsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedAdminRoute } from './components/ProtectedAdminRoute';
import { useAuthStore } from './store/auth';

function App() {
  const isAuth = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useAuthStore((s) => !!s.user?.is_cafeteria_admin);

  return (
    <Routes>
      {/* Login: si ya esta logueado como admin redirigir a dashboard */}
      <Route
        path="/login"
        element={
          isAuth && isAdmin ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />

      {/* Panel admin: protegido */}
      <Route
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id" element={<OrderDetailPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/timeslots" element={<TimeslotsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
