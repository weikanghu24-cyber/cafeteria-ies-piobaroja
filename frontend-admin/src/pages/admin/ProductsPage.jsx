import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Leaf,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminProductsApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Modal, ConfirmModal } from '@/components/Modal';
import { formatPrice, cn } from '@/utils/cn';
import { getErrorMessage } from '@/api/client';

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const queryClient = useQueryClient();

  const { data: categoriesRaw } = useQuery({
    queryKey: ['categories'],
    queryFn: () => adminProductsApi.categories().then((r) => r.data),
  });
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw
    : categoriesRaw?.results || [];

  const params = {};
  if (search) params.search = search;
  if (filterCategoria !== 'all') params.categoria = filterCategoria;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => adminProductsApi.list(params).then((r) => r.data),
  });

  const products = productsData?.results || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => adminProductsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Producto eliminado');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
            Productos
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} en el catálogo
          </p>
        </div>
        <button onClick={() => setCreatingProduct(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nuevo producto
        </button>
      </header>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-coffee-500" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterCategoria}
          onChange={(e) => setFilterCategoria(e.target.value)}
          className="input-field max-w-[200px]"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Lista */}
      {isLoading ? (
        <LoadingScreen />
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No hay productos"
          description="Empieza añadiendo el primer producto al catálogo."
          action={
            <button onClick={() => setCreatingProduct(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Añadir producto
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product, idx) => (
            <ProductRow
              key={product.id}
              product={product}
              index={idx}
              onEdit={() => setEditingProduct(product)}
              onDelete={() => setDeletingProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Modal crear/editar */}
      <ProductFormModal
        open={creatingProduct || !!editingProduct}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setCreatingProduct(false);
          setEditingProduct(null);
        }}
      />

      {/* Modal confirmar eliminación */}
      <ConfirmModal
        open={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={() => {
          if (deletingProduct) deleteMutation.mutate(deletingProduct.id);
        }}
        title="¿Eliminar producto?"
        message={`Se eliminará "${deletingProduct?.nombre}" del catálogo. Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar"
        danger
      />
    </div>
  );
}

function ProductRow({ product, index, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="card overflow-hidden"
    >
      <div className="aspect-[16/10] bg-cream-200 relative">
        {product.imagen_url ? (
          <img
            src={product.imagen_url}
            alt={product.nombre}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-coffee-300">
            <ImageIcon className="w-10 h-10" strokeWidth={1.2} />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {product.es_saludable && (
            <span className="bg-white/90 backdrop-blur px-1.5 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-medium text-healthy-dark">
              <Leaf className="w-2.5 h-2.5" />
              Saludable
            </span>
          )}
          {!product.disponible && (
            <span className="bg-coffee-900/90 backdrop-blur text-cream-100 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
              No disponible
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-wider text-coffee-500 font-bold mb-0.5">
          {product.categoria_nombre}
        </p>
        <h3 className="font-display text-base font-semibold text-coffee-900 mb-1 truncate">
          {product.nombre}
        </h3>
        {product.descripcion && (
          <p className="text-xs text-coffee-600 line-clamp-2 mb-2">{product.descripcion}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="font-display text-xl font-bold text-coffee-900">
            {formatPrice(product.precio)}
          </span>
          <div className="flex gap-1">
            <button
              onClick={onEdit}
              aria-label="Editar"
              className="w-8 h-8 rounded-lg hover:bg-cream-200 flex items-center justify-center text-coffee-700"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              aria-label="Eliminar"
              className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-coffee-700"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {product.stock < 999 && (
          <p className="text-[10px] text-coffee-500 mt-2">
            Stock: <span className="font-semibold">{product.stock}</span>
          </p>
        )}
      </div>
    </motion.div>
  );
}

function ProductFormModal({ open, product, categories, onClose }) {
  const isEditing = !!product;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    imagen_url: '',
    es_saludable: false,
    disponible: true,
    stock: 999,
  });

  // Cargar datos del producto cuando cambia (o resetear cuando es nuevo)
  useEffect(() => {
    if (!open) return;
    if (product) {
      setForm({
        nombre: product.nombre || '',
        descripcion: product.descripcion || '',
        precio: product.precio?.toString() || '',
        categoria_id: product.categoria || '',
        imagen_url: product.imagen_url || '',
        es_saludable: !!product.es_saludable,
        disponible: !!product.disponible,
        stock: product.stock ?? 999,
      });
    } else {
      setForm({
        nombre: '',
        descripcion: '',
        precio: '',
        categoria_id: '',
        imagen_url: '',
        es_saludable: false,
        disponible: true,
        stock: 999,
      });
    }
  }, [product, open]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? adminProductsApi.update(product.id, data)
        : adminProductsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success(isEditing ? 'Producto actualizado' : 'Producto creado');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio || !form.categoria_id) {
      toast.error('Rellena los campos obligatorios');
      return;
    }
    saveMutation.mutate({
      ...form,
      categoria_id: parseInt(form.categoria_id),
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock) || 999,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Nuevo producto'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nombre *" required>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="input-field"
            placeholder="Bocadillo de jamón"
            required
            maxLength={120}
          />
        </FormField>

        <FormField label="Descripción">
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            className="input-field resize-none"
            rows={2}
            placeholder="Pan rústico con jamón ibérico y aceite de oliva"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Precio (€) *" required>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              className="input-field"
              placeholder="3.50"
              required
            />
          </FormField>

          <FormField label="Categoría *" required>
            <select
              value={form.categoria_id}
              onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="URL de imagen"
          hint="Recomendado: imágenes de Unsplash. Ej: https://images.unsplash.com/photo-..."
        >
          <input
            type="url"
            value={form.imagen_url}
            onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
            className="input-field"
            placeholder="https://images.unsplash.com/..."
          />
          {form.imagen_url && (
            <div className="mt-2 w-32 h-24 rounded-lg overflow-hidden bg-cream-200 border border-coffee-200">
              <img src={form.imagen_url} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </FormField>

        <FormField
          label="Stock"
          hint="Pon 999 si no quieres limitar el stock diario"
        >
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="input-field"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <Checkbox
            label="Disponible"
            checked={form.disponible}
            onChange={(v) => setForm({ ...form, disponible: v })}
            description="Visible en el menú"
          />
          <Checkbox
            label="Saludable 🥗"
            checked={form.es_saludable}
            onChange={(v) => setForm({ ...form, es_saludable: v })}
            description="Aparece como opción saludable"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-coffee-100">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancelar
          </button>
          <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear producto'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FormField({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-coffee-700 mb-1.5 uppercase tracking-wide">
        {label}
      </span>
      {children}
      {hint && <p className="text-[11px] text-coffee-500 mt-1">{hint}</p>}
    </label>
  );
}

function Checkbox({ label, checked, onChange, description }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        'flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all',
        checked
          ? 'border-coffee-900 bg-coffee-50'
          : 'border-coffee-200 hover:border-coffee-300'
      )}
    >
      <div
        className={cn(
          'w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
          checked ? 'bg-coffee-900 border-coffee-900' : 'border-coffee-300'
        )}
      >
        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-cream-100" strokeWidth={3} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-coffee-900">{label}</p>
        {description && <p className="text-[11px] text-coffee-600">{description}</p>}
      </div>
    </button>
  );
}
