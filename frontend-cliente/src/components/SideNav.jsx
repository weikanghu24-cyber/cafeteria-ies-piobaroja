import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Heart, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

const links = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/orders', label: 'Mis pedidos', icon: Receipt },
];

export function SideNav() {
  return (
    <nav className="hidden md:flex flex-col gap-1 sticky top-24 w-56 shrink-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-coffee-500 px-4 mb-2">
        Navegación
      </p>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200',
              isActive
                ? 'bg-coffee-900 text-cream-100 shadow-soft'
                : 'text-coffee-700 hover:bg-cream-200'
            )
          }
        >
          <Icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          <span className="font-medium text-sm">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
