import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/api/endpoints';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Aunque falle el endpoint, hacemos logout local
    }
    logout();
    clearCart();
    toast.success('Sesión cerrada');
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const initials = (user.first_name?.[0] || user.username?.[0] || '?').toUpperCase();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-coffee-900 tracking-tight">
          Mi perfil
        </h1>
      </header>

      <section className="card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-coffee-900 text-cream-100 font-display text-2xl font-bold flex items-center justify-center shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl font-semibold text-coffee-900 truncate">
            {user.first_name || user.username} {user.last_name}
          </h2>
          <p className="text-sm text-coffee-600 truncate">@{user.username}</p>
        </div>
      </section>

      <section className="card overflow-hidden divide-y divide-coffee-100">
        <Item icon={User} label="Nombre" value={`${user.first_name || '—'} ${user.last_name || ''}`} />
        <Item icon={Mail} label="Email" value={user.email || '—'} />
        <Item
          icon={Shield}
          label="Tipo de cuenta"
          value={user.is_cafeteria_admin ? 'Administrador' : 'Cliente'}
        />
      </section>

      <button onClick={handleLogout} className="btn-secondary w-full text-red-600 hover:text-red-700 hover:border-red-200">
        <LogOut className="w-4 h-4" />
        Cerrar sesión
      </button>

      <p className="text-center text-xs text-coffee-400">
        Cafetería IES Pío Baroja · v1.0
      </p>
    </div>
  );
}

function Item({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4">
      <Icon className="w-4 h-4 text-coffee-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-coffee-500 font-bold">
          {label}
        </p>
        <p className="text-sm text-coffee-900 truncate">{value}</p>
      </div>
    </div>
  );
}
