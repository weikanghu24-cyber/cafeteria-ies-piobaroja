import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Users,
  Loader2,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminTimeslotsApi } from '@/api/endpoints';
import { LoadingScreen } from '@/components/Loading';
import { EmptyState } from '@/components/EmptyState';
import { Modal, ConfirmModal } from '@/components/Modal';
import { formatTime, formatDate, cn } from '@/utils/cn';
import { getErrorMessage } from '@/api/client';

export function TimeslotsPage() {
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const queryClient = useQueryClient();

  const { data: timeslotsData, isLoading } = useQuery({
    queryKey: ['admin', 'timeslots'],
    queryFn: () => adminTimeslotsApi.list().then((r) => r.data),
  });

  const timeslots = timeslotsData?.results || timeslotsData || [];

  // Agrupar por fecha
  const grouped = useMemo(() => {
    const map = {};
    timeslots.forEach((t) => {
      (map[t.fecha] = map[t.fecha] || []).push(t);
    });
    return map;
  }, [timeslots]);

  const deleteMutation = useMutation({
    mutationFn: (id) => adminTimeslotsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'timeslots'] });
      toast.success('Franja eliminada');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-coffee-900 tracking-tight">
            Franjas horarias
          </h1>
          <p className="text-coffee-600 text-sm mt-1">
            Crea las franjas en las que los alumnos pueden recoger sus pedidos
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Nueva franja
        </button>
      </header>

      {isLoading ? (
        <LoadingScreen />
      ) : timeslots.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No hay franjas horarias"
          description="Crea franjas para que los alumnos puedan elegir cuándo recoger sus pedidos."
          action={
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              Crear primera franja
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([fecha, franjas]) => (
            <DayGroup
              key={fecha}
              fecha={fecha}
              franjas={franjas}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      <TimeslotFormModal
        open={creating || !!editing}
        timeslot={editing}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
      />

      <ConfirmModal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate(deleting.id);
        }}
        title="¿Eliminar franja?"
        message={
          deleting?.pedidos_count > 0
            ? `Atención: esta franja tiene ${deleting.pedidos_count} pedidos asociados. Si la eliminas, los pedidos podrían quedar sin franja.`
            : '¿Seguro que quieres eliminar esta franja horaria? Esta acción no se puede deshacer.'
        }
        confirmText="Sí, eliminar"
        danger
      />
    </div>
  );
}

function DayGroup({ fecha, franjas, onEdit, onDelete }) {
  const isPast = new Date(fecha) < new Date(new Date().toDateString());
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-coffee-500" />
        <h2 className="font-display text-lg font-semibold text-coffee-900 capitalize">
          {formatDate(fecha)}
        </h2>
        {isPast && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-coffee-500 px-2 py-0.5 bg-coffee-100 rounded">
            Pasada
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {franjas.map((franja, idx) => (
          <TimeslotCard
            key={franja.id}
            franja={franja}
            index={idx}
            onEdit={() => onEdit(franja)}
            onDelete={() => onDelete(franja)}
            isPast={isPast}
          />
        ))}
      </div>
    </section>
  );
}

function TimeslotCard({ franja, index, onEdit, onDelete, isPast }) {
  const ocupacion = (franja.pedidos_count / franja.capacidad_max) * 100;
  const lleno = franja.lleno;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'card p-4',
        isPast && 'opacity-60',
        !franja.activo && 'border-dashed'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-display text-xl font-bold text-coffee-900">
            {formatTime(franja.hora_inicio)}–{formatTime(franja.hora_fin)}
          </p>
          {!franja.activo && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-coffee-500">
              Inactiva
            </span>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            aria-label="Editar"
            className="w-7 h-7 rounded-lg hover:bg-cream-200 flex items-center justify-center text-coffee-700"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            aria-label="Eliminar"
            className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-coffee-700"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Ocupación */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-coffee-600 flex items-center gap-1">
            <Users className="w-3 h-3" />
            {franja.pedidos_count} / {franja.capacidad_max}
          </span>
          <span
            className={cn(
              'font-semibold',
              lleno ? 'text-red-600' : ocupacion > 70 ? 'text-accent-dark' : 'text-healthy-dark'
            )}
          >
            {lleno ? 'Completa' : `${franja.plazas_disponibles} plazas libres`}
          </span>
        </div>
        <div className="h-1.5 bg-cream-200 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full transition-all',
              lleno ? 'bg-red-500' : ocupacion > 70 ? 'bg-accent' : 'bg-healthy'
            )}
            style={{ width: `${Math.min(ocupacion, 100)}%` }}
          />
        </div>
      </div>

      {franja.notas && (
        <p className="text-[11px] text-coffee-600 italic mt-2 truncate">"{franja.notas}"</p>
      )}
    </motion.div>
  );
}

function TimeslotFormModal({ open, timeslot, onClose }) {
  const isEditing = !!timeslot;
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    capacidad_max: 20,
    activo: true,
    notas: '',
  });

  useEffect(() => {
    if (!open) return;
    if (timeslot) {
      setForm({
        fecha: timeslot.fecha || '',
        hora_inicio: timeslot.hora_inicio?.slice(0, 5) || '',
        hora_fin: timeslot.hora_fin?.slice(0, 5) || '',
        capacidad_max: timeslot.capacidad_max ?? 20,
        activo: !!timeslot.activo,
        notas: timeslot.notas || '',
      });
    } else {
      // Default: mañana, recreo típico
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setForm({
        fecha: tomorrow.toISOString().split('T')[0],
        hora_inicio: '11:00',
        hora_fin: '11:30',
        capacidad_max: 20,
        activo: true,
        notas: '',
      });
    }
  }, [timeslot, open]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? adminTimeslotsApi.update(timeslot.id, data)
        : adminTimeslotsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'timeslots'] });
      toast.success(isEditing ? 'Franja actualizada' : 'Franja creada');
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fecha || !form.hora_inicio || !form.hora_fin) {
      toast.error('Rellena los campos obligatorios');
      return;
    }
    if (form.hora_inicio >= form.hora_fin) {
      toast.error('La hora de inicio debe ser anterior a la de fin');
      return;
    }
    saveMutation.mutate({
      ...form,
      capacidad_max: parseInt(form.capacidad_max) || 20,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar franja horaria' : 'Nueva franja horaria'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Fecha *">
          <input
            type="date"
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            className="input-field"
            required
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Hora inicio *">
            <input
              type="time"
              value={form.hora_inicio}
              onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
              className="input-field"
              required
            />
          </FormField>
          <FormField label="Hora fin *">
            <input
              type="time"
              value={form.hora_fin}
              onChange={(e) => setForm({ ...form, hora_fin: e.target.value })}
              className="input-field"
              required
            />
          </FormField>
        </div>

        <FormField
          label="Capacidad máxima"
          hint="Número máximo de pedidos que se pueden hacer en esta franja"
        >
          <input
            type="number"
            min="1"
            max="200"
            value={form.capacidad_max}
            onChange={(e) => setForm({ ...form, capacidad_max: e.target.value })}
            className="input-field"
          />
        </FormField>

        <FormField label="Notas (opcional)">
          <input
            type="text"
            value={form.notas}
            onChange={(e) => setForm({ ...form, notas: e.target.value })}
            className="input-field"
            placeholder="P.ej. Recreo grande"
            maxLength={200}
          />
        </FormField>

        <button
          type="button"
          onClick={() => setForm({ ...form, activo: !form.activo })}
          className={cn(
            'w-full flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all',
            form.activo
              ? 'border-coffee-900 bg-coffee-50'
              : 'border-coffee-200 hover:border-coffee-300'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors',
              form.activo ? 'bg-coffee-900 border-coffee-900' : 'border-coffee-300'
            )}
          >
            {form.activo && <CheckCircle2 className="w-3.5 h-3.5 text-cream-100" strokeWidth={3} />}
          </div>
          <div>
            <p className="text-sm font-semibold text-coffee-900">Franja activa</p>
            <p className="text-[11px] text-coffee-600">Si está inactiva, los alumnos no pueden seleccionarla</p>
          </div>
        </button>

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
              'Crear franja'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function FormField({ label, hint, children }) {
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
