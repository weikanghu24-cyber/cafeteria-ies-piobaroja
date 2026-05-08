import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Receipt, ChevronRight, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { ordersApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice, formatDate, formatTime, cn } from '@/utils/cn';

const ESTADO_COLORS = {
  pendiente_pago: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  pagado: 'bg-blue-100 text-blue-800 border-blue-200',
  preparando: 'bg-accent/10 text-accent-dark border-accent/20',
  listo: 'bg-healthy/15 text-healthy-dark border-healthy/30',
  entregado: 'bg-coffee-100 text-coffee-700 border-coffee-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200',
};

export function OrdersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.list().then((r) => r.data),
  });

  const cancelMutation = useMutation({
    mutationFn: (id) => ordersApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Pedido cancelado');
    },
    onError: () => toast.error('No se pudo cancelar el pedido'),
  });

  const orders = data?.results || [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-coffee-900 tracking-tight">
          Mis pedidos
        </h1>
        <p className="text-coffee-600 text-sm mt-1">
          Historial completo y estado actual
        </p>
      </header>

      {isLoading ? (
        <LoadingScreen />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Aún no has hecho pedidos"
          description="Cuando hagas tu primer pedido aparecerá aquí con su estado."
          action={
            <Link to="/menu" className="btn-primary">
              Explorar menú
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {orders.map((order, idx) => (
            <motion.li
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
            >
              <Link
                to={`/orders/${order.id}/confirmacion`}
                className="card p-4 sm:p-5 flex items-center gap-4 hover:bg-cream-100 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center shrink-0">
                  <Receipt className="w-5 h-5 text-coffee-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-display text-base font-semibold text-coffee-900">
                      Pedido #{order.id}
                    </span>
                    <span
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border',
                        ESTADO_COLORS[order.estado] || 'bg-coffee-100 text-coffee-700'
                      )}
                    >
                      {order.estado_display}
                    </span>
                  </div>
                  <p className="text-xs text-coffee-600 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3 h-3" />
                    <span className="capitalize">{formatDate(order.franja.fecha)}</span>
                    <span>·</span>
                    <span>{formatTime(order.franja.hora_inicio)}–{formatTime(order.franja.hora_fin)}</span>
                  </p>
                  <p className="text-xs text-coffee-500 truncate">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    {' · '}
                    Código <span className="font-mono font-bold text-coffee-700">{order.codigo_recogida}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-display text-lg font-bold text-coffee-900">
                    {formatPrice(order.total)}
                  </span>
                  {order.estado === 'pendiente_pago' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (confirm('¿Cancelar este pedido?')) {
                          cancelMutation.mutate(order.id);
                        }
                      }}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Cancelar
                    </button>
                  )}
                  <ChevronRight className="w-4 h-4 text-coffee-400 group-hover:text-coffee-700 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
