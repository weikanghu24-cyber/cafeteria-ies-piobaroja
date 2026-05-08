import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Leaf, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritesApi } from '@/api/endpoints';
import { useCartStore } from '@/store/cart';
import { formatPrice, cn } from '@/utils/cn';
import toast from 'react-hot-toast';

export function ProductCard({ product, index = 0 }) {
  const [justAdded, setJustAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const queryClient = useQueryClient();

  const toggleFav = useMutation({
    mutationFn: () => favoritesApi.toggle(product.id),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      if (data.favorito) toast.success('Añadido a favoritos');
    },
    onError: () => toast.error('No se pudo actualizar favorito'),
  });

  const handleAdd = () => {
    if (!product.disponible) return;
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="card overflow-hidden group flex flex-col"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-cream-200 overflow-hidden">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-coffee-300">
            <span className="text-4xl">☕</span>
          </div>
        )}

        {/* Badge saludable */}
        {product.es_saludable && (
          <div className="absolute top-3 left-3 badge-healthy backdrop-blur-md bg-white/90">
            <Leaf className="w-3 h-3" />
            <span>Saludable</span>
          </div>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleFav.mutate();
          }}
          aria-label={product.es_favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md
                     flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
        >
          <Heart
            className={cn(
              'w-4 h-4 transition-colors',
              product.es_favorito
                ? 'fill-accent text-accent'
                : 'text-coffee-600'
            )}
          />
        </button>

        {/* No disponible */}
        {!product.disponible && (
          <div className="absolute inset-0 bg-coffee-900/60 flex items-center justify-center">
            <span className="text-cream-100 font-medium text-sm bg-coffee-900 px-3 py-1 rounded-full">
              No disponible
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-coffee-500 mb-1">
          {product.categoria_nombre}
        </p>
        <h3 className="font-display text-base font-semibold text-coffee-900 leading-tight mb-1 line-clamp-1">
          {product.nombre}
        </h3>
        {product.descripcion && (
          <p className="text-xs text-coffee-600 line-clamp-2 mb-3 leading-relaxed">
            {product.descripcion}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="font-display text-xl font-bold text-coffee-900">
            {formatPrice(product.precio)}
          </span>
          <button
            onClick={handleAdd}
            disabled={!product.disponible}
            aria-label={`Añadir ${product.nombre} al carrito`}
            className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              'shadow-soft transition-all duration-200 active:scale-90',
              justAdded
                ? 'bg-healthy text-white'
                : 'bg-coffee-900 text-cream-100 hover:bg-coffee-800 hover:shadow-soft-lg disabled:bg-coffee-300 disabled:cursor-not-allowed'
            )}
          >
            {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
