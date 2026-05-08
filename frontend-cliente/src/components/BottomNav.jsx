import { NavLink } from 'react-router-dom';
import { Home, UtensilsCrossed, Heart, Receipt } from 'lucide-react';
import { cn } from '@/utils/cn';

const links = [
  { to: '/', label: 'Inicio', icon: Home, end: true },
  { to: '/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/favorites', label: 'Favoritos', icon: Heart },
  { to: '/orders', label: 'Pedidos', icon: Receipt },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-cream-50/95 backdrop-blur-lg border-t border-coffee-100 pb-safe">
      <div className="flex items-stretch justify-around h-16">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive
                  ? 'text-coffee-900'
                  : 'text-coffee-400 hover:text-coffee-700'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={cn(
                  'p-1.5 rounded-full transition-all',
                  isActive && 'bg-coffee-900/8 scale-110'
                )}>
                  <Icon className="w-[18px] h-[18px]" strokeWidth={isActive ? 2.4 : 1.8} />
                </div>
                <span className={cn(
                  'text-[10px] font-medium tracking-wide',
                  isActive && 'font-semibold'
                )}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
