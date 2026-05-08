import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { HomePage } from './pages/client/HomePage';
import { MenuPage } from './pages/client/MenuPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { OrderConfirmationPage } from './pages/client/OrderConfirmationPage';
import { OrdersPage } from './pages/client/OrdersPage';
import { FavoritesPage } from './pages/client/FavoritesPage';
import { NotificationsPage } from './pages/client/NotificationsPage';
import { ProfilePage } from './pages/client/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ClientLayout } from './components/ClientLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/auth';

function App() {
  const isAuth = useAuthStore((s) => !!s.accessToken);

  return (
    <Routes>
      {/* Auth: si ya esta logueado redirigir a home */}
      <Route
        path="/login"
        element={isAuth ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuth ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Cliente: protegidas */}
      <Route
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/:id/confirmacion" element={<OrderConfirmationPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Checkout: protegida pero sin layout (pantalla completa) */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <div className="min-h-screen pt-safe pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
              <BackHeader />
              <CheckoutPage />
            </div>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function BackHeader() {
  return (
    <header className="py-4 mb-2">
      <a href="/menu" className="text-coffee-700 text-sm font-medium hover:text-coffee-900 inline-flex items-center gap-1">
        ← Volver al menú
      </a>
    </header>
  );
}

export default App;
