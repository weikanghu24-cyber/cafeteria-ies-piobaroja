import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, ArrowRight, AlertCircle, CheckCircle2, Loader2, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminOrdersApi } from '@/api/endpoints';
import { formatPrice, formatTime, estadoBadgeClass, cn } from '@/utils/cn';
import { getErrorMessage } from '@/api/client';

export function ScannerPage() {
  const [codigo, setCodigo] = useState('');
  const [foundOrder, setFoundOrder] = useState(null);
  const inputRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Auto-focus el input al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buscarMutation = useMutation({
    mutationFn: (cod) => adminOrdersApi.porCodigo(cod.toUpperCase().trim()),
    onSuccess: ({ data }) => {
      setFoundOrder(data);
    },
    onError: (err) => {
      setFoundOrder(null);
      toast.error(getErrorMessage(err));
    },
  });

  const entregarMutation = useMutation({
    mutationFn: (id) => adminOrdersApi.cambiarEstado(id, 'entregado'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      toast.success('¡Pedido entregado!');
      setFoundOrder(null);
      setCodigo('');
      setTimeout(() => inputRef.current?.focus(), 100);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (codigo.trim().length < 4) {
      toast.error('Introduce un código válido');
      return;
    }
    buscarMutation.mutate(codigo);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
          Verificar código
        </h1>
        <p className="text-coffee-600 text-sm mt-1">
          Introduce el código del cliente para verificar y entregar su pedido.
        </p>
      </header>

      {/* Input de código */}
      <section className="card p-5 md:p-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 mb-4">
          <ScanLine className="w-6 h-6 text-accent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-semibold text-coffee-700 mb-2 uppercase tracking-wide">
              Código de recogida
            </span>
            <input
              ref={inputRef}
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase().slice(0, 8))}
              placeholder="K7M3X9"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              className="input-field !text-2xl !font-mono !font-bold !tracking-[0.2em] !text-center !py-4 !uppercase"
            />
          </label>

          <button
            type="submit"
            disabled={buscarMutation.isPending || codigo.length < 4}
            className="btn-primary w-full !py-3 !text-base"
          >
            {buscarMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                Buscar pedido
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-coffee-500 text-center mt-4">
          Pide al cliente que te muestre el código en su app o el QR de su pantalla.
        </p>
      </section>

      {/* Resultado */}
      <AnimatePresence mode="wait">
        {foundOrder && (
          <motion.section
            key={foundOrder.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card p-5 md:p-6"
          >
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-coffee-500 font-bold mb-0.5">
                  Pedido encontrado
                </p>
                <p className="font-mono font-bold text-2xl text-coffee-900">
                  {foundOrder.codigo_recogida}
                </p>
              </div>
              <span className={cn(estadoBadgeClass(foundOrder.estado), '!text-sm !px-3 !py-1.5')}>
                {foundOrder.estado_display}
              </span>
            </div>

            {/* Aviso según estado */}
            {foundOrder.estado === 'entregado' && (
              <Alert variant="info" icon={CheckCircle2}>
                Este pedido ya fue entregado el{' '}
                {new Date(foundOrder.entregado_en).toLocaleString('es-ES')}.
              </Alert>
            )}
            {foundOrder.estado === 'cancelado' && (
              <Alert variant="error" icon={AlertCircle}>
                Este pedido fue cancelado y no se puede entregar.
              </Alert>
            )}
            {foundOrder.estado === 'pendiente_pago' && (
              <Alert variant="warning" icon={AlertCircle}>
                El cliente aún no ha pagado este pedido. No se puede entregar.
              </Alert>
            )}
            {(foundOrder.estado === 'pagado' || foundOrder.estado === 'preparando') && (
              <Alert variant="warning" icon={AlertCircle}>
                Este pedido aún no está marcado como "listo".
                {' '}
                <button
                  className="underline font-medium hover:no-underline"
                  onClick={() => navigate(`/orders/${foundOrder.id}`)}
                >
                  Ir al detalle para gestionarlo →
                </button>
              </Alert>
            )}
            {foundOrder.estado === 'listo' && (
              <Alert variant="success" icon={CheckCircle2}>
                Pedido listo para entregar. Confirma cuando se lo entregues al cliente.
              </Alert>
            )}

            {/* Detalles */}
            <div className="space-y-3 mb-5 text-sm">
              <div className="flex justify-between">
                <span className="text-coffee-600">Cliente</span>
                <span className="font-medium text-coffee-900">{foundOrder.user_username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">Franja</span>
                <span className="font-medium text-coffee-900">
                  {formatTime(foundOrder.franja.hora_inicio)}–{formatTime(foundOrder.franja.hora_fin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-coffee-600">Total</span>
                <span className="font-display font-bold text-coffee-900">
                  {formatPrice(foundOrder.total)}
                </span>
              </div>
            </div>

            {/* Productos */}
            <div className="border-t border-coffee-100 pt-3 mb-5">
              <p className="text-[10px] uppercase tracking-wider text-coffee-500 font-bold mb-2">
                Productos ({foundOrder.items.length})
              </p>
              <ul className="space-y-1.5 text-sm">
                {foundOrder.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span className="text-coffee-800">
                      <span className="font-bold">{item.cantidad}×</span> {item.product.nombre}
                    </span>
                    <span className="text-coffee-600">{formatPrice(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {foundOrder.notas && (
              <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-3 mb-5">
                <p className="text-[10px] uppercase tracking-wider text-yellow-800 font-bold mb-1">
                  Nota del cliente
                </p>
                <p className="text-sm text-coffee-800 italic">"{foundOrder.notas}"</p>
              </div>
            )}

            {/* Acción principal */}
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/orders/${foundOrder.id}`)}
                className="btn-secondary"
              >
                Ver detalle
              </button>
              {foundOrder.estado === 'listo' && (
                <button
                  onClick={() => entregarMutation.mutate(foundOrder.id)}
                  disabled={entregarMutation.isPending}
                  className="btn-accent flex-1 !py-3 !text-base"
                >
                  {entregarMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Entregando...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Confirmar entrega
                    </>
                  )}
                </button>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}

function Alert({ children, variant = 'info', icon: Icon }) {
  const variants = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-healthy/10 border-healthy/30 text-healthy-dark',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
  };
  return (
    <div className={cn('rounded-xl border p-3 flex gap-2 mb-4 text-sm', variants[variant])}>
      <Icon className="w-4 h-4 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
