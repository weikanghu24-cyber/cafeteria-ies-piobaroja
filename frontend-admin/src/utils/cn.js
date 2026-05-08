import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value) {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(n);
}

export function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

export function formatDateShort(dateStr) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  return timeStr.slice(0, 5);
}

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Mapping de estados de pedido a colores de badge
export function estadoBadgeClass(estado) {
  const map = {
    pendiente_pago: 'badge-yellow',
    pagado: 'badge-blue',
    preparando: 'badge-orange',
    listo: 'badge-green',
    entregado: 'badge-gray',
    cancelado: 'badge-red',
  };
  return `badge ${map[estado] || 'badge-gray'}`;
}
