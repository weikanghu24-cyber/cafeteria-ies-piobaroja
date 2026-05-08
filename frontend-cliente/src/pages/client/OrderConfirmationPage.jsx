import { Link, useParams, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Receipt, Home } from 'lucide-react';
import { ordersApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { formatPrice, formatDate, formatTime } from '@/utils/cn';

export function OrderConfirmationPage() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['orders', id],
    queryFn: () => ordersApi.detail(id).then((r) => r.data),
  });

  const { data: qrData } = useQuery({
    queryKey: ['orders', id, 'qr'],
    queryFn: () => ordersApi.qr(id).then((r) => r.data),
    enabled: !!order && order.estado !== 'pendiente_pago',
  });

  if (isLoading) return <LoadingScreen message="Cargando confirmación..." />;
  if (!order) return <Navigate to="/orders" replace />;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Cabecera de éxito */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1, damping: 12 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-healthy/15 mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-healthy-dark" strokeWidth={2} />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-coffee-900 mb-2">
          ¡Pedido confirmado!
        </h1>
        <p className="text-coffee-600 text-sm max-w-xs mx-auto">
          Pásate a recogerlo a la hora elegida con este código.
        </p>
      </motion.div>

      {/* QR Card */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6 sm:p-8 text-center bg-gradient-to-br from-cream-50 to-cream-200 border-coffee-200"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-coffee-500 mb-3">
          Tu código de recogida
        </p>

        <p className="font-display text-5xl sm:text-6xl font-bold text-coffee-900 tracking-[0.15em] mb-5 select-all">
          {order.codigo_recogida}
        </p>

        {qrData?.qr_data_url && (
          <div className="inline-block bg-white p-3 rounded-2xl shadow-soft">
            <img
              src={qrData.qr_data_url}
              alt={`Código QR ${order.codigo_recogida}`}
              className="w-40 h-40 sm:w-48 sm:h-48"
            />
          </div>
        )}

        <p className="text-xs text-coffee-600 mt-4 max-w-xs mx-auto">
          Enseña este código al personal de la cafetería al recoger
        </p>
      </motion.section>

      {/* Detalles */}
      <section className="card p-5 space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-xs uppercase tracking-wide text-coffee-500 font-semibold">
              Recogida
            </p>
            <p className="font-display text-lg font-semibold text-coffee-900 capitalize">
              {formatDate(order.franja.fecha)}
            </p>
            <p className="text-sm text-coffee-700">
              Entre las {formatTime(order.franja.hora_inicio)} y las{' '}
              {formatTime(order.franja.hora_fin)}
            </p>
          </div>
        </div>

        <div className="border-t border-coffee-100 pt-4">
          <p className="text-xs uppercase tracking-wide text-coffee-500 font-semibold mb-2">
            Productos ({order.items.length})
          </p>
          <ul className="space-y-1.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm">
                <span className="text-coffee-700">
                  <span className="font-medium">{item.cantidad}×</span>{' '}
                  {item.product.nombre}
                </span>
                <span className="text-coffee-900 font-medium">
                  {formatPrice(item.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-coffee-200 pt-3 flex justify-between items-baseline">
          <span className="font-display text-base font-semibold text-coffee-900">
            Total pagado
          </span>
          <span className="font-display text-2xl font-bold text-coffee-900">
            {formatPrice(order.total)}
          </span>
        </div>

        {order.notas && (
          <div className="border-t border-coffee-100 pt-3">
            <p className="text-xs uppercase tracking-wide text-coffee-500 font-semibold mb-1">
              Notas
            </p>
            <p className="text-sm text-coffee-700 italic">"{order.notas}"</p>
          </div>
        )}
      </section>

      {/* Acciones */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/orders" className="btn-secondary">
          <Receipt className="w-4 h-4" />
          Mis pedidos
        </Link>
        <Link to="/" className="btn-primary">
          <Home className="w-4 h-4" />
          Inicio
        </Link>
      </div>
    </div>
  );
}
