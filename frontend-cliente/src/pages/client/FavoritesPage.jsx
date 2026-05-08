import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { favoritesApi } from '@/api/endpoints';
import { ProductCard } from '@/components/ProductCard';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';

export function FavoritesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesApi.list().then((r) => r.data),
  });

  const items = data?.results || [];
  const products = items.map((f) => f.product_data);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-coffee-900 tracking-tight">
          Favoritos
        </h1>
        <p className="text-coffee-600 text-sm mt-1">
          Tus productos guardados para acceso rápido
        </p>
      </header>

      {isLoading ? (
        <LoadingScreen />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Aún no tienes favoritos"
          description="Toca el corazón de cualquier producto para guardarlo aquí."
          action={
            <Link to="/menu" className="btn-primary">
              Ver el menú
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, idx) => (
            <ProductCard key={p.id} product={p} index={idx} />
          ))}
        </div>
      )}
    </div>
  );
}
