import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { product, cantidad }

      addItem: (product, cantidad = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.product.id === product.id);
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id
                ? { ...i, cantidad: Math.min(i.cantidad + cantidad, 20) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, cantidad }] });
        }
      },

      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.product.id !== productId) }),

      updateCantidad: (productId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId
              ? { ...i, cantidad: Math.min(cantidad, 20) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalItems: () =>
        get().items.reduce((sum, i) => sum + i.cantidad, 0),

      getTotal: () =>
        get().items.reduce(
          (sum, i) => sum + parseFloat(i.product.precio) * i.cantidad,
          0
        ),

      // Helper: items en formato para POST /api/orders/
      getOrderItems: () =>
        get().items.map((i) => ({
          product_id: i.product.id,
          cantidad: i.cantidad,
        })),
    }),
    { name: 'cafeteria-cart' }
  )
);
