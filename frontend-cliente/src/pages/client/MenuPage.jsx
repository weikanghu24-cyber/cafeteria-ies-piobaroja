import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Leaf, X, SlidersHorizontal } from 'lucide-react';
import { productsApi } from '@/api/endpoints';
import { ProductCard } from '@/components/ProductCard';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { cn } from '@/utils/cn';

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  const categoriaId = searchParams.get('categoria');
  const saludable = searchParams.get('saludable') === 'true';

  // Debounce de busqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories().then((r) => r.data),
  });
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw?.results || [];

  const params = {};
  if (categoriaId) params.categoria = categoriaId;
  if (saludable) params.saludable = 'true';
  if (debouncedSearch) params.search = debouncedSearch;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.list(params).then((r) => r.data),
  });

  const products = productsData?.results || [];

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasFilters = !!(categoriaId || saludable || debouncedSearch);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-coffee-900 tracking-tight">
          Menú
        </h1>
        <p className="text-coffee-600 text-sm mt-1">
          Pide lo que más te apetezca de la cafetería
        </p>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-500" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Buscar bocadillo, café, manzana..."
          className="input-field pl-11 pr-11"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            aria-label="Limpiar búsqueda"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros: scroll horizontal en mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <FilterChip
          active={!categoriaId && !saludable}
          onClick={clearAllFilters}
        >
          Todo
        </FilterChip>

        <FilterChip
          active={saludable}
          onClick={() => updateFilter('saludable', saludable ? null : 'true')}
          icon={Leaf}
          accent
        >
          Saludable
        </FilterChip>

        <div className="w-px h-6 bg-coffee-200 shrink-0" />

        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            active={categoriaId === String(cat.id)}
            onClick={() =>
              updateFilter(
                'categoria',
                categoriaId === String(cat.id) ? null : cat.id
              )
            }
          >
            {cat.nombre}
          </FilterChip>
        ))}
      </div>

      {/* Resultados */}
      {isLoading ? (
        <LoadingScreen message="Cargando productos..." />
      ) : products.length === 0 ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="Nada por aquí"
          description="No hay productos que coincidan con tu búsqueda. Prueba con otros filtros."
          action={
            hasFilters && (
              <button onClick={clearAllFilters} className="btn-secondary">
                Limpiar filtros
              </button>
            )
          }
        />
      ) : (
        <>
          <p className="text-xs text-coffee-500">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children, icon: Icon, accent }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shrink-0',
        'transition-all duration-200',
        active
          ? accent
            ? 'bg-healthy text-white shadow-soft'
            : 'bg-coffee-900 text-cream-100 shadow-soft'
          : 'bg-cream-100 text-coffee-700 hover:bg-cream-200 border border-coffee-100'
      )}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {children}
    </button>
  );
}
