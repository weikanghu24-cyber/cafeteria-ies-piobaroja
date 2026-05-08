import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { formatPrice } from '@/utils/cn';
import { EmptyState } from './EmptyState';

export function CartDrawer({ open, onClose }) {
  const navigate = useNavigate();
  const { items, updateCantidad, removeItem, getTotal, clearCart } = useCartStore();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-coffee-900/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-cream-50 z-50
                       shadow-soft-lg flex flex-col pt-safe pb-safe"
          >
            {/* Header */}
            <header className="flex items-center justify-between p-5 border-b border-coffee-100">
              <div>
                <h2 className="font-display text-xl font-semibold text-coffee-900">
                  Tu pedido
                </h2>
                <p className="text-xs text-coffee-600 font-body">
                  {items.length} {items.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Cerrar carrito"
                className="w-9 h-9 rounded-full bg-cream-200 hover:bg-cream-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-coffee-700" />
              </button>
            </header>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Tu carrito está vacío"
                  description="Añade productos del menú para empezar tu pedido"
                />
              ) : (
                <ul className="space-y-3">
                  {items.map((item) => (
                    <li
                      key={item.product.id}
                      className="flex gap-3 p-3 bg-white rounded-2xl border border-coffee-100"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-200 shrink-0">
                        {item.product.imagen_url && (
                          <img
                            src={item.product.imagen_url}
                            alt={item.product.nombre}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-coffee-900 truncate">
                          {item.product.nombre}
                        </h4>
                        <p className="text-xs text-coffee-500 mb-2">
                          {formatPrice(item.product.precio)} c/u
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-cream-100 rounded-full p-0.5">
                            <button
                              onClick={() =>
                                updateCantidad(item.product.id, item.cantidad - 1)
                              }
                              aria-label="Reducir"
                              className="w-7 h-7 rounded-full bg-white hover:bg-cream-200 flex items-center justify-center transition"
                            >
                              <Minus className="w-3 h-3 text-coffee-700" />
                            </button>
                            <span className="w-7 text-center font-medium text-sm text-coffee-900">
                              {item.cantidad}
                            </span>
                            <button
                              onClick={() =>
                                updateCantidad(item.product.id, item.cantidad + 1)
                              }
                              aria-label="Aumentar"
                              className="w-7 h-7 rounded-full bg-white hover:bg-cream-200 flex items-center justify-center transition"
                            >
                              <Plus className="w-3 h-3 text-coffee-700" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            aria-label="Eliminar"
                            className="text-coffee-400 hover:text-coffee-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <footer className="p-5 border-t border-coffee-100 bg-cream-100">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-sm text-coffee-600">Total</span>
                  <span className="font-display text-2xl font-bold text-coffee-900">
                    {formatPrice(getTotal())}
                  </span>
                </div>
                <button onClick={handleCheckout} className="btn-primary w-full">
                  Continuar al pago
                </button>
                <button
                  onClick={clearCart}
                  className="w-full text-center text-xs text-coffee-500 hover:text-coffee-700 mt-3 py-2"
                >
                  Vaciar carrito
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
