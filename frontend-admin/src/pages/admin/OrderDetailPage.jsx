import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  User,
  CheckCircle2,
  Package,
  Truck,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminOrdersApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { ConfirmModal } from '@/components/Modal';
import {
  formatPrice,
  formatTime,
  formatDate,
  formatDateTime,
  estadoBadgeClass,
  cn,
} from '@/utils/cn';
import { getErrorMessage } from '@/api/client';

// Transiciones permitidas: estado actual -> [siguientes posibles]
const NEXT_STATES = {
  pendiente_pago: [],
  pagado: ['preparando', 'cancelado'],
  preparando: ['listo', 'cancelado'],
  listo: ['entregado'],
  entregado: [],
  cancelado: [],
};

const STATE_LABELS = {
  preparando: { label: 'Marcar como "preparando"', icon: Package, variant: 'primary' },
  listo: { label: 'Marcar como "listo"', icon: CheckCircle2, variant: 'accent' },
  entregado: { label: 'Confirmar entrega', icon: Truck, variant: 'primary' },
  cancelado: { label: 'Cancelar pedido', icon: X, variant: 'danger' },
};

export function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmState, setConfirmState] = useState(null); // estado pendiente de confirmar

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin', 'orders', id],
    queryFn: () => adminOrdersApi.detail(id).then((r) => r.data),
    refetchInterval: 15000,
  });

  const cambiarEstado = useMutation({
    mutationFn: (estado) => adminOrdersApi.cambiarEstado(id, estado),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      toast.success(`Pedido marcado como "${data.estado_display}"`);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (isLoading) return <LoadingScreen />;
  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-coffee-600 mb-4">Pedido no encontrado</p>
        <Link to="/orders" className="btn-primary">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const allowedNext = NEXT_STATES[order.estado] || [];

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-coffee-600 hover:text-coffee-900 flex items-center gap-1 mb-3 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a pedidos
        </button>

        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-coffee-500 font-bold mb-1">
              Pedido #{order.id}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
              <span className="font-mono">{order.codigo_recogida}</span>
            </h1>
          </div>
          <span className={cn(estadoBadgeClass(order.estado), '!text-sm !px-3 !py-1.5')}>
            {order.estado_display}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="md:col-span-2 space-y-4">
          {/* Productos */}
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold text-coffee-900 mb-4">
              Productos ({order.items.length})
            </h2>
            <ul className="divide-y divide-coffee-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  {item.product.imagen_url && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-200 shrink-0">
                      <img
                        src={item.product.imagen_url}
                        alt={item.product.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-coffee-900 truncate">
                      {item.product.nombre}
                    </p>
                    <p className="text-xs text-coffee-500">
                      {item.cantidad} × {formatPrice(item.precio_unitario)}
                    </p>
                  </div>
                  <span className="font-display font-bold text-coffee-900">
                    {formatPrice(item.subtotal)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-coffee-200 pt-3 mt-3 flex items-baseline justify-between">
              <span className="font-display text-base font-semibold text-coffee-900">
                Total
              </span>
              <span className="font-display text-2xl font-bold text-coffee-900">
                {formatPrice(order.total)}
              </span>
            </div>
          </section>

          {/* Notas */}
          {order.notas && (
            <section className="card p-5 bg-yellow-50/40 border-yellow-200">
              <h3 className="text-xs uppercase tracking-wider font-bold text-yellow-800 mb-1">
                Notas del cliente
              </h3>
              <p className="text-sm text-coffee-800 italic">"{order.notas}"</p>
            </section>
          )}

          {/* Acciones de cambio de estado */}
          {allowedNext.length > 0 && (
            <section className="card p-5">
              <h2 className="font-display text-lg font-semibold text-coffee-900 mb-3">
                Acciones disponibles
              </h2>
              <div className="flex flex-wrap gap-2">
                {allowedNext.map((nextEstado) => {
                  const config = STATE_LABELS[nextEstado];
                  if (!config) return null;
                  const Icon = config.icon;
                  const btnClass =
                    config.variant === 'danger'
                      ? 'btn-danger'
                      : config.variant === 'accent'
                      ? 'btn-accent'
                      : 'btn-primary';
                  return (
                    <button
                      key={nextEstado}
                      onClick={() => setConfirmState(nextEstado)}
                      disabled={cambiarEstado.isPending}
                      className={cn(btnClass, '!py-2.5')}
                    >
                      {cambiarEstado.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Columna lateral - info */}
        <div className="space-y-4">
          <section className="card p-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-coffee-500 mb-3">
              Información
            </h3>

            <InfoRow icon={User} label="Cliente">
              <p className="font-medium text-coffee-900">{order.user_username}</p>
            </InfoRow>

            <InfoRow icon={Clock} label="Recogida">
              <p className="font-medium text-coffee-900 capitalize">
                {formatDate(order.franja.fecha)}
              </p>
              <p className="text-xs text-coffee-600">
                {formatTime(order.franja.hora_inicio)}–{formatTime(order.franja.hora_fin)}
              </p>
            </InfoRow>
          </section>

          <section className="card p-5">
            <h3 className="text-xs uppercase tracking-wider font-bold text-coffee-500 mb-3">
              Cronología
            </h3>
            <div className="space-y-3 text-sm">
              <Timeline label="Creado" date={order.creado} />
              {order.pagado_en && (
                <Timeline label="Pagado" date={order.pagado_en} highlight />
              )}
              {order.entregado_en && (
                <Timeline label="Entregado" date={order.entregado_en} highlight />
              )}
              {order.actualizado !== order.creado && (
                <Timeline label="Última actualización" date={order.actualizado} small />
              )}
            </div>
          </section>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={() => cambiarEstado.mutate(confirmState)}
        title={
          confirmState === 'cancelado'
            ? '¿Cancelar este pedido?'
            : `¿Cambiar estado a "${STATE_LABELS[confirmState]?.label.replace('Marcar como ', '').replace(/"/g, '')}"?`
        }
        message={
          confirmState === 'cancelado'
            ? 'El cliente recibirá una notificación. Esta acción no se puede deshacer.'
            : 'El cliente verá el cambio de estado en su app y recibirá una notificación.'
        }
        confirmText={confirmState === 'cancelado' ? 'Sí, cancelar' : 'Confirmar'}
        danger={confirmState === 'cancelado'}
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex gap-3 py-2 first:pt-0 last:pb-0">
      <Icon className="w-4 h-4 text-coffee-500 shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-coffee-500 font-bold mb-0.5">
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}

function Timeline({ label, date, highlight, small }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          'w-1.5 h-1.5 rounded-full shrink-0',
          highlight ? 'bg-healthy' : 'bg-coffee-300'
        )}
      />
      <span className={cn('text-coffee-600', small ? 'text-xs' : 'text-sm')}>
        {label}:
      </span>
      <span className={cn('font-medium text-coffee-900 ml-auto', small ? 'text-xs' : 'text-sm')}>
        {formatDateTime(date)}
      </span>
    </div>
  );
}
