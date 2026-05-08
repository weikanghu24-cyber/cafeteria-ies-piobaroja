import { Link } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="font-display text-9xl font-bold text-coffee-900 leading-none">404</p>
      <h1 className="font-display text-2xl font-bold text-coffee-900 mt-4 mb-2">
        Página no encontrada
      </h1>
      <p className="text-coffee-600 mb-6 max-w-sm">
        Esta ruta del panel no existe.
      </p>
      <Link to="/dashboard" className="btn-primary">
        <LayoutDashboard className="w-4 h-4" />
        Volver al dashboard
      </Link>
    </div>
  );
}
