import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Clock, Leaf } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { productsApi, timeslotsApi } from '@/api/endpoints';
import { ProductCard } from '@/components/ProductCard';
import { Spinner } from '@/components/Loading';
import { formatTime } from '@/utils/cn';

export function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.categories().then((r) => r.data),
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', { saludable: true }],
    queryFn: () =>
      productsApi.list({ saludable: 'true' }).then((r) => r.data),
  });

  const { data: franjas } = useQuery({
    queryKey: ['timeslots', 'disponibles'],
    queryFn: () => timeslotsApi.disponibles().then((r) => r.data),
  });

  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw?.results || [];
  const products = (productsData?.results || []).slice(0, 4);
  const proximaFranja = franjas?.[0];

  const greeting = getGreeting();
  const firstName = user?.first_name || user?.username?.split('.')[0] || 'tú';

  return (
    <div className="space-y-10">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-coffee-900 text-cream-100 p-6 sm:p-10"
      >
        {/* Decoración fondo */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-coffee-700 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10 max-w-2xl">
          <p className="text-accent-light text-sm font-medium mb-2">
            {greeting}, {firstName} ✦
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold leading-[1.05] mb-4 tracking-tight text-balance">
            ¿Qué te apetece <span className="italic font-normal text-accent-light">hoy?</span>
          </h1>
          <p className="text-cream-200/80 text-base mb-6 max-w-md leading-relaxed">
            Pide ahora y recoge cuando quieras. Sin colas, sin esperas.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/menu" className="btn-accent">
              Ver el menú
              <ArrowRight className="w-4 h-4" />
            </Link>
            {proximaFranja && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-100/10 backdrop-blur-md border border-cream-100/20 text-cream-100 text-sm">
                <Clock className="w-4 h-4 text-accent-light" />
                <span className="font-medium">
                  Próxima franja: {formatTime(proximaFranja.hora_inicio)}–{formatTime(proximaFranja.hora_fin)}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* Categorías */}
      {categories.length > 0 && (
        <section>
          <SectionHeader title="Categorías" subtitle="Encuentra lo que buscas" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categories.map((cat, idx) => (
              <CategoryCard key={cat.id} cat={cat} index={idx} />
            ))}
          </div>
        </section>
      )}

      {/* Recomendados saludables */}
      <section>
        <SectionHeader
          title="Opciones saludables"
          subtitle="Para empezar el día con energía"
          icon={Leaf}
          link="/menu?saludable=true"
        />
        {loadingProducts ? (
          <div className="flex justify-center py-12">
            <Spinner />
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p, idx) => (
              <ProductCard key={p.id} product={p} index={idx} />
            ))}
          </div>
        ) : (
          <p className="text-coffee-500 text-sm">No hay productos disponibles</p>
        )}
      </section>

      {/* CTA inferior */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="card p-6 sm:p-8 text-center bg-gradient-to-br from-cream-100 to-cream-200 border-coffee-200"
      >
        <Sparkles className="w-8 h-8 text-accent mx-auto mb-3" />
        <h3 className="font-display text-2xl font-bold text-coffee-900 mb-2">
          Aprovecha el recreo
        </h3>
        <p className="text-coffee-600 text-sm mb-5 max-w-sm mx-auto">
          Haz tu pedido ahora y pásate a recogerlo. Tendrás más tiempo para lo importante.
        </p>
        <Link to="/menu" className="btn-primary">
          Pedir ahora
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.section>
    </div>
  );
}

function SectionHeader({ title, subtitle, icon: Icon, link }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        {Icon && (
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-wider text-accent">
              Recomendado
            </span>
          </div>
        )}
        <h2 className="font-display text-2xl font-bold text-coffee-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-coffee-600 mt-0.5">{subtitle}</p>
        )}
      </div>
      {link && (
        <Link
          to={link}
          className="text-sm font-medium text-coffee-700 hover:text-coffee-900 flex items-center gap-1"
        >
          Ver todo
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function CategoryCard({ cat, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/menu?categoria=${cat.id}`}
        className="card p-4 flex flex-col items-center text-center hover:bg-cream-100 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-cream-200 flex items-center justify-center mb-2 text-2xl">
          {getCategoryEmoji(cat.nombre)}
        </div>
        <span className="font-medium text-sm text-coffee-900">{cat.nombre}</span>
        <span className="text-[10px] text-coffee-500 uppercase tracking-wide mt-0.5">
          {cat.productos_count} {cat.productos_count === 1 ? 'opción' : 'opciones'}
        </span>
      </Link>
    </motion.div>
  );
}

function getCategoryEmoji(nombre) {
  const map = {
    bocadillos: '🥪',
    bebidas: '🥤',
    cafe: '☕',
    café: '☕',
    dulces: '🍪',
    saludable: '🥗',
  };
  return map[nombre.toLowerCase()] || '🍴';
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
}
