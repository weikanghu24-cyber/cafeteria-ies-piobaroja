import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Bell, BellOff, Check, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationsApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';

const TIPO_ICONS = {
  pedido_estado: '📦',
  pago_exito: '✅',
  recordatorio: '⏰',
  cierre_proximo: '⚠️',
  general: '📢',
};

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list().then((r) => r.data),
  });

  const markRead = useMutation({
    mutationFn: (id) => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Todas marcadas como leídas');
    },
  });

  const items = data?.results || [];
  const unreadCount = items.filter((n) => !n.leida).length;

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-coffee-900 tracking-tight">
            Notificaciones
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            {unreadCount > 0
              ? `${unreadCount} sin leer`
              : 'Estás al día'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="btn-ghost text-xs"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Marcar todas
          </button>
        )}
      </header>

      {isLoading ? (
        <LoadingScreen />
      ) : items.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title="Sin notificaciones"
          description="Recibirás avisos del estado de tus pedidos y otra información importante."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((n, idx) => (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                'card p-4 flex items-start gap-3',
                !n.leida && 'bg-accent/5 border-accent/20'
              )}
            >
              <span className="text-2xl shrink-0 mt-0.5">
                {TIPO_ICONS[n.tipo] || '📢'}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm',
                  n.leida ? 'text-coffee-700' : 'text-coffee-900 font-medium'
                )}>
                  {n.mensaje}
                </p>
                <p className="text-[10px] text-coffee-500 uppercase tracking-wide mt-1">
                  {new Date(n.creado).toLocaleString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              {!n.leida && (
                <button
                  onClick={() => markRead.mutate(n.id)}
                  aria-label="Marcar como leída"
                  className="text-coffee-400 hover:text-coffee-700 shrink-0 p-1"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
