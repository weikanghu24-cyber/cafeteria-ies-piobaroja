import { cn } from '@/utils/cn';

export function Spinner({ className, size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
  };
  return (
    <div
      className={cn(
        'rounded-full border-coffee-200 border-t-coffee-700 animate-spin',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function LoadingScreen({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Spinner size="lg" />
      <p className="text-coffee-600 font-body text-sm">{message}</p>
    </div>
  );
}

export function FullPageLoading() {
  return (
    <div className="fixed inset-0 bg-cream-50 flex items-center justify-center z-50">
      <Spinner size="lg" />
    </div>
  );
}
