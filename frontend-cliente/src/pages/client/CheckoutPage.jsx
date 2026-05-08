import { useState, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, CreditCard, Lock, Loader2, AlertCircle } from 'lucide-react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import { ordersApi, timeslotsApi, paymentsApi } from '@/api/endpoints';
import { useCartStore } from '@/store/cart';
import { LoadingScreen, Spinner } from '@/components/Loading';
import { formatPrice, formatTime, formatDate, cn } from '@/utils/cn';
import { getErrorMessage } from '@/api/client';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState('franja'); // franja -> pago
  const [franjaSeleccionada, setFranjaSeleccionada] = useState(null);
  const [notas, setNotas] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [paymentClientSecret, setPaymentClientSecret] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  if (items.length === 0 && !orderData) {
    return <Navigate to="/menu" replace />;
  }

  const { data: franjas, isLoading: loadingFranjas } = useQuery({
    queryKey: ['timeslots', 'disponibles'],
    queryFn: () => timeslotsApi.disponibles().then((r) => r.data),
  });

  const createOrderMutation = useMutation({
    mutationFn: (data) => ordersApi.create(data),
    onSuccess: async ({ data: order }) => {
      setOrderData(order);
      try {
        const { data: intent } = await paymentsApi.createIntent(order.id);
        setPaymentClientSecret(intent.client_secret);
        setStripePromise(loadStripe(intent.publishable_key));
        setStep('pago');
      } catch (err) {
        toast.error('Error al iniciar el pago. Inténtalo de nuevo.');
        // Si falla, cancelar el pedido
        ordersApi.cancel(order.id).catch(() => {});
        setOrderData(null);
      }
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleContinuarAPago = () => {
    if (!franjaSeleccionada) {
      toast.error('Selecciona una franja horaria');
      return;
    }
    createOrderMutation.mutate({
      franja_id: franjaSeleccionada.id,
      items: items.map((i) => ({
        product_id: i.product.id,
        cantidad: i.cantidad,
      })),
      notas,
    });
  };

  // Agrupar franjas por fecha
  const franjasPorDia = useMemo(() => {
    if (!franjas) return {};
    return franjas.reduce((acc, f) => {
      (acc[f.fecha] = acc[f.fecha] || []).push(f);
      return acc;
    }, {});
  }, [franjas]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold text-coffee-900 tracking-tight">
          Finalizar pedido
        </h1>
        <Stepper step={step} />
      </header>

      {step === 'franja' && (
        <>
          {/* Resumen */}
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold text-coffee-900 mb-3">
              Resumen del pedido
            </h2>
            <ul className="divide-y divide-coffee-100">
              {items.map((item) => (
                <li key={item.product.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-coffee-900 truncate">
                      {item.product.nombre}
                    </span>
                    <span className="text-coffee-500 shrink-0">× {item.cantidad}</span>
                  </div>
                  <span className="font-medium text-coffee-900 shrink-0 ml-3">
                    {formatPrice(parseFloat(item.product.precio) * item.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-coffee-200">
              <span className="font-display text-lg font-semibold text-coffee-900">Total</span>
              <span className="font-display text-2xl font-bold text-coffee-900">
                {formatPrice(getTotal())}
              </span>
            </div>
          </section>

          {/* Selección de franja */}
          <section className="card p-5">
            <h2 className="font-display text-lg font-semibold text-coffee-900 mb-1 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              Hora de recogida
            </h2>
            <p className="text-xs text-coffee-600 mb-4">
              Elige cuándo quieres pasarte a recoger tu pedido
            </p>

            {loadingFranjas ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : !franjas || franjas.length === 0 ? (
              <div className="rounded-2xl bg-cream-200 p-4 text-center text-sm text-coffee-600 flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4" />
                No hay franjas disponibles ahora mismo
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(franjasPorDia).map(([fecha, fr]) => (
                  <div key={fecha}>
                    <p className="text-xs font-bold uppercase tracking-wider text-coffee-500 mb-2 px-1">
                      {formatDate(fecha)}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {fr.map((f) => {
                        const isSelected = franjaSeleccionada?.id === f.id;
                        const llena = f.lleno;
                        return (
                          <button
                            key={f.id}
                            disabled={llena}
                            onClick={() => setFranjaSeleccionada(f)}
                            className={cn(
                              'p-3 rounded-2xl border-2 text-left transition-all',
                              isSelected
                                ? 'bg-coffee-900 border-coffee-900 text-cream-100'
                                : llena
                                ? 'bg-cream-200 border-coffee-200 opacity-50 cursor-not-allowed'
                                : 'bg-white border-coffee-200 hover:border-coffee-500'
                            )}
                          >
                            <p className={cn(
                              'font-display text-base font-semibold',
                              isSelected ? 'text-cream-100' : 'text-coffee-900'
                            )}>
                              {formatTime(f.hora_inicio)}–{formatTime(f.hora_fin)}
                            </p>
                            <p className={cn(
                              'text-[10px] mt-0.5',
                              isSelected ? 'text-cream-200/70' : 'text-coffee-500'
                            )}>
                              {llena
                                ? 'Completo'
                                : `${f.plazas_disponibles} ${f.plazas_disponibles === 1 ? 'plaza' : 'plazas'}`}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Notas */}
          <section className="card p-5">
            <label className="block">
              <span className="font-display text-lg font-semibold text-coffee-900 mb-1 block">
                Notas (opcional)
              </span>
              <span className="text-xs text-coffee-600 mb-3 block">
                ¿Algo importante? P.ej. "sin azúcar", "calentado"
              </span>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={2}
                maxLength={300}
                className="input-field resize-none"
                placeholder="Tu nota..."
              />
            </label>
          </section>

          <button
            onClick={handleContinuarAPago}
            disabled={!franjaSeleccionada || createOrderMutation.isPending}
            className="btn-primary w-full text-base py-4"
          >
            {createOrderMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Preparando pago...
              </>
            ) : (
              <>
                Continuar al pago · {formatPrice(getTotal())}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </>
      )}

      {step === 'pago' && paymentClientSecret && stripePromise && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentClientSecret,
            appearance: {
              theme: 'flat',
              variables: {
                colorPrimary: '#3d2817',
                colorBackground: '#ffffff',
                colorText: '#3d2817',
                colorDanger: '#dc2626',
                fontFamily: 'Manrope, system-ui, sans-serif',
                spacingUnit: '4px',
                borderRadius: '12px',
              },
            },
          }}
        >
          <PaymentForm
            order={orderData}
            onSuccess={() => {
              clearCart();
              navigate(`/orders/${orderData.id}/confirmacion`, { replace: true });
            }}
          />
        </Elements>
      )}
    </div>
  );
}

function PaymentForm({ order, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (stripeError) {
      setError(stripeError.message || 'Error al procesar el pago');
      toast.error(stripeError.message || 'Pago rechazado');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        await paymentsApi.confirm(paymentIntent.id);
        toast.success('¡Pago confirmado!');
        onSuccess();
      } catch (err) {
        setError('El pago se ha realizado pero hubo un error confirmando. Contacta con la cafetería.');
      }
    } else {
      setError('Pago no completado');
      setProcessing(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handlePay}
      className="space-y-4"
    >
      <section className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-coffee-900 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            Datos de pago
          </h2>
          <span className="text-xs text-coffee-500 flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Seguro · Stripe
          </span>
        </div>

        <PaymentElement />

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </section>

      {/* Aviso modo TEST */}
      <div className="rounded-2xl bg-accent/5 border border-accent/20 p-3 text-xs text-coffee-700">
        <p className="font-semibold mb-1 text-accent-dark">⚠ Modo de prueba</p>
        <p className="leading-relaxed">
          Usa la tarjeta <code className="bg-white px-1.5 py-0.5 rounded font-mono">4242 4242 4242 4242</code> para que se acepte, o <code className="bg-white px-1.5 py-0.5 rounded font-mono">4000 0000 0000 0002</code> para que se rechace. Cualquier CVC y fecha futura.
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn-primary w-full text-base py-4"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pagar {formatPrice(order.total)}
          </>
        )}
      </button>
    </motion.form>
  );
}

function Stepper({ step }) {
  const steps = [
    { key: 'franja', label: 'Recogida' },
    { key: 'pago', label: 'Pago' },
  ];
  const currentIdx = steps.findIndex((s) => s.key === step);

  return (
    <div className="flex items-center gap-2 mt-3">
      {steps.map((s, idx) => (
        <div key={s.key} className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium',
              idx <= currentIdx
                ? 'bg-coffee-900 text-cream-100'
                : 'bg-cream-200 text-coffee-500'
            )}
          >
            <span
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                idx <= currentIdx ? 'bg-cream-100 text-coffee-900' : 'bg-coffee-300 text-cream-50'
              )}
            >
              {idx + 1}
            </span>
            {s.label}
          </div>
          {idx < steps.length - 1 && (
            <div className={cn(
              'h-px w-6',
              idx < currentIdx ? 'bg-coffee-900' : 'bg-coffee-200'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}
