import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ShoppingCart, Filter, RefreshCw, Search } from 'lucide-react';
import { adminOrdersApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { formatPrice, formatTime, formatDateTime, estadoBadgeClass, cn } from '@/utils/cn';

const ESTADO_FILTERS = [
  { key: 'all', label: 'Todos' },
  { key: 'pagado', label: 'Pagados', highlight: true },
  { key: 'preparando', label: 'Preparando' },
  { key: 'listo', label: 'Listos' },
  { key: 'entregado', label: 'Entregados' },
  { key: 'cancelado', label: 'Cancelados' },
];

export function OrdersPage() {
  const [filterEstado, setFilterEstado] = useState('all');
  const [search, setSearch] = useState('');

  const params = {};
  if (filterEstado !== 'all') params.estado = filterEstado;
  if (search) params.search = search;

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => adminOrdersApi.list(params).then((r) => r.data),
    refetchInterval: 10000, // Polling cada 10s
  });

  const orders = data?.results || [];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
            Pedidos
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            Gestiona los pedidos en tiempo real ·{' '}
            <span className="font-medium">{orders.length} mostrados</span>
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-secondary"
          aria-label="Actualizar"
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          Actualizar
        </button>
      </header>

      {/* Búsqueda */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por código de recogida..."
          className="input-field pl-10"
        />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        <Filter className="w-4 h-4 text-coffee-500 shrink-0" />
        {ESTADO_FILTERS.map(({ key, label, highlight }) => (
          <button
            key={key}
            onClick={() => setFilterEstado(key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all',
              filterEstado === key
                ? 'bg-coffee-900 text-cream-100 shadow-soft'
                : 'bg-white border border-coffee-200 text-coffee-700 hover:bg-cream-100',
              highlight && filterEstado !== key && 'ring-2 ring-accent/30'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {isLoading ? (
        <LoadingScreen />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No hay pedidos"
          description={
            filterEstado === 'all'
              ? 'Cuando los alumnos hagan pedidos aparecerán aquí.'
              : `No hay pedidos en estado "${ESTADO_FILTERS.find((f) => f.key === filterEstado)?.label}".`
          }
        />
      ) : (
        <>
          {/* Vista desktop: tabla */}
          <div className="hidden md:block card overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-coffee-100">
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Código
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Cliente
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Franja
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Productos
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Estado
                  </th>
                  <th className="text-right text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {orders.map((order, idx) => (
                  <motion.tr
                    key={order.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="table-row"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-mono font-bold text-sm text-coffee-900 hover:text-accent"
                      >
                        {order.codigo_recogida}
                      </Link>
                      <p className="text-[10px] text-coffee-500 mt-0.5">
                        #{order.id} · {formatDateTime(order.creado)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p className="font-medium text-coffee-900">
                        {order.user_username}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-coffee-700">
                      <p className="font-medium">
                        {formatTime(order.franja.hora_inicio)}–{formatTime(order.franja.hora_fin)}
                      </p>
                      <p className="text-[10px] text-coffee-500">
                        {new Date(order.franja.fecha).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-coffee-600 max-w-xs">
                      <p className="truncate">
                        {order.items.map((i) => `${i.cantidad}× ${i.product.nombre}`).join(', ')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={estadoBadgeClass(order.estado)}>
                        {order.estado_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-display font-bold text-sm text-coffee-900">
                      {formatPrice(order.total)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista móvil: cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
              >
                <Link to={`/orders/${order.id}`} className="card p-4 block hover:bg-cream-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono font-bold text-base text-coffee-900">
                        {order.codigo_recogida}
                      </p>
                      <p className="text-[10px] text-coffee-500 mt-0.5">
                        #{order.id} · {order.user_username}
                      </p>
                    </div>
                    <span className={estadoBadgeClass(order.estado)}>
                      {order.estado_display}
                    </span>
                  </div>
                  <p className="text-xs text-coffee-600 mb-2">
                    {formatTime(order.franja.hora_inicio)}–{formatTime(order.franja.hora_fin)} ·{' '}
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-coffee-100">
                    <span className="text-[10px] text-coffee-500">
                      {formatDateTime(order.creado)}
                    </span>
                    <span className="font-display font-bold text-coffee-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
