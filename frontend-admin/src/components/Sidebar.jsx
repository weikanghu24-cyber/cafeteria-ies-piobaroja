import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Clock,
  LogOut,
  User,
  Menu,
  X,
  ScanLine,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Logo } from './Logo';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/utils/cn';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/orders', label: 'Pedidos', icon: ShoppingCart, badge: 'live' },
  { to: '/scanner', label: 'Verificar código', icon: ScanLine },
  { to: '/products', label: 'Productos', icon: Package },
  { to: '/timeslots', label: 'Franjas horarias', icon: Clock },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menú"
        className="md:hidden fixed top-4 left-4 z-30 w-10 h-10 rounded-xl bg-white border border-coffee-200 flex items-center justify-center shadow-soft"
      >
        <Menu className="w-5 h-5 text-coffee-700" />
      </button>

      {/* Backdrop móvil */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-coffee-900/40 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 md:z-0',
          'w-64 h-screen bg-white border-r border-coffee-100',
          'flex flex-col',
          'transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <SidebarContent onNavigate={() => setMobileOpen(false)} />
      </aside>
    </>
  );
}

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorar
    }
    logout();
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  const initials = (user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase();

  return (
    <>
      <div className="px-5 py-6 border-b border-coffee-100">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coffee-500 px-3 mb-2">
          Gestión
        </p>
        <div className="space-y-1">
          {NAV_LINKS.map(({ to, label, icon: Icon, badge, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-coffee-900 text-cream-100 shadow-soft'
                    : 'text-coffee-700 hover:bg-cream-100'
                )
              }
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              <span className="flex-1">{label}</span>
              {badge === 'live' && (
                <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-500/10 text-red-600 text-[9px] font-bold rounded uppercase tracking-wider">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                  Live
                </span>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Usuario */}
      <div className="border-t border-coffee-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-coffee-900 text-cream-100 font-display text-sm font-bold flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-coffee-900 truncate">
              {user?.first_name || user?.username}
            </p>
            <p className="text-[11px] text-coffee-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-coffee-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}
