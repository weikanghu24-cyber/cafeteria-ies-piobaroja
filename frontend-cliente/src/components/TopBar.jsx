import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Bell, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Logo } from './Logo';
import { CartDrawer } from './CartDrawer';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { notificationsApi } from '@/api/endpoints';

export function TopBar() {
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const isAuth = useAuthStore((s) => !!s.accessToken);

  const { data: unread } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data),
    enabled: isAuth,
    refetchInterval: 30000,
  });

  const unreadCount = unread?.count || 0;

  return (
    <>
      <header className="sticky top-0 z-30 bg-cream-50/90 backdrop-blur-lg border-b border-coffee-100/60 pt-safe">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" aria-label="Inicio" className="hover:opacity-80 transition">
            <Logo />
          </Link>

          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/notifications')}
              aria-label="Notificaciones"
              className="relative w-10 h-10 rounded-full hover:bg-cream-200 flex items-center justify-center transition"
            >
              <Bell className="w-5 h-5 text-coffee-700" strokeWidth={1.8} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1
                                 bg-accent text-white text-[10px] font-bold rounded-full
                                 flex items-center justify-center animate-bounce-subtle">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              aria-label="Carrito"
              className="relative w-10 h-10 rounded-full hover:bg-cream-200 flex items-center justify-center transition"
            >
              <ShoppingBag className="w-5 h-5 text-coffee-700" strokeWidth={1.8} />
              {totalItems > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1
                                 bg-coffee-900 text-cream-100 text-[10px] font-bold rounded-full
                                 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/profile')}
              aria-label="Mi cuenta"
              className="w-10 h-10 rounded-full hover:bg-cream-200 flex items-center justify-center transition"
            >
              <User className="w-5 h-5 text-coffee-700" strokeWidth={1.8} />
            </button>
          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
