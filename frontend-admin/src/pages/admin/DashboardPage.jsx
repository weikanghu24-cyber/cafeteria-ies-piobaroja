import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Euro,
  Clock,
  ArrowRight,
  Package,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { adminOrdersApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { formatPrice, formatTime, estadoBadgeClass } from '@/utils/cn';

export function DashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminOrdersApi.dashboard().then((r) => r.data),
    refetchInterval: 30000,
  });

  // Pedidos recientes pagados/preparando/listos para mostrar en el dashboard
  const { data: ordersData } = useQuery({
    queryKey: ['admin', 'orders', 'recent'],
    queryFn: () => adminOrdersApi.list({ ordering: '-creado' }).then((r) => r.data),
    refetchInterval: 15000,
  });

  const recentOrders = (ordersData?.results || []).slice(0, 5);

  if (isLoading) return <LoadingScreen message="Cargando dashboard..." />;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            Resumen de la actividad de hoy ·{' '}
            <span className="font-medium">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-healthy/10 border border-healthy/30 text-healthy-dark text-xs font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-healthy animate-pulse" />
          Actualizado en tiempo real
        </div>
      </header>

      {/* Tarjetas de stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={ShoppingCart}
          label="Pedidos hoy"
          value={dashboard?.total ?? 0}
          color="bg-blue-50 text-blue-600 border-blue-200"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Por preparar"
          value={(dashboard?.pagado ?? 0) + (dashboard?.preparando ?? 0)}
          color="bg-accent/10 text-accent-dark border-accent/30"
          delay={0.05}
          highlight={(dashboard?.pagado ?? 0) + (dashboard?.preparando ?? 0) > 0}
        />
        <StatCard
          icon={CheckCircle2}
          label="Listos recoger"
          value={dashboard?.listo ?? 0}
          color="bg-healthy/10 text-healthy-dark border-healthy/30"
          delay={0.1}
          highlight={dashboard?.listo > 0}
        />
        <StatCard
          icon={Euro}
          label="Entregados"
          value={dashboard?.entregado ?? 0}
          color="bg-coffee-100 text-coffee-700 border-coffee-200"
          delay={0.15}
        />
      </section>

      {/* Acciones rápidas */}
      <section>
        <h2 className="font-display text-xl font-bold text-coffee-900 mb-3">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickAction
            to="/orders"
            icon={ShoppingCart}
            title="Ver pedidos"
            description="Gestiona los pedidos en curso"
          />
          <QuickAction
            to="/scanner"
            icon={ScanLine}
            title="Verificar código"
            description="Confirma la recogida de un pedido"
            primary
          />
          <QuickAction
            to="/products"
            icon={Package}
            title="Productos"
            description="Añade o edita el catálogo"
          />
        </div>
      </section>

      {/* Pedidos recientes */}
      {recentOrders.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-xl font-bold text-coffee-900">
              Pedidos recientes
            </h2>
            <Link
              to="/orders"
              className="text-sm text-coffee-700 hover:text-coffee-900 flex items-center gap-1 font-medium"
            >
              Ver todos
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-cream-100 border-b border-coffee-100">
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Código
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3 hidden sm:table-cell">
                    Cliente
                  </th>
                  <th className="text-left text-[10px] uppercase tracking-wider text-coffee-500 font-bold px-4 py-3">
                    Franja
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="table-row">
                    <td className="px-4 py-3">
                      <Link
                        to={`/orders/${order.id}`}
                        className="font-mono font-bold text-sm text-coffee-900 hover:text-accent"
                      >
                        {order.codigo_recogida}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-coffee-700 hidden sm:table-cell">
                      {order.user_username}
                    </td>
                    <td className="px-4 py-3 text-sm text-coffee-700">
                      {formatTime(order.franja.hora_inicio)}–{formatTime(order.franja.hora_fin)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={estadoBadgeClass(order.estado)}>
                        {order.estado_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-display font-bold text-sm text-coffee-900">
                      {formatPrice(order.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delay = 0, highlight }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`stat-card ${highlight ? 'ring-2 ring-accent/30' : ''}`}
    >
      <div className={`inline-flex w-10 h-10 rounded-xl items-center justify-center mb-3 border ${color}`}>
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-coffee-500 mb-1">
        {label}
      </p>
      <p className="font-display text-2xl md:text-3xl font-bold text-coffee-900">
        {value}
      </p>
    </motion.div>
  );
}

function QuickAction({ to, icon: Icon, title, description, primary }) {
  return (
    <Link
      to={to}
      className={`card p-5 flex items-start gap-4 hover:shadow-soft-lg transition-all group ${
        primary ? 'bg-coffee-900 text-cream-100 border-coffee-900' : ''
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          primary ? 'bg-accent text-white' : 'bg-cream-200 text-coffee-700'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={`font-semibold text-sm mb-0.5 ${
            primary ? 'text-cream-100' : 'text-coffee-900'
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs ${primary ? 'text-cream-200/70' : 'text-coffee-600'}`}
        >
          {description}
        </p>
      </div>
      <ArrowRight
        className={`w-4 h-4 shrink-0 group-hover:translate-x-0.5 transition ${
          primary ? 'text-cream-100' : 'text-coffee-400'
        }`}
      />
    </Link>
  );
}
