import { cn } from '@/utils/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center mb-4">
          <Icon className="w-7 h-7 text-coffee-500" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-coffee-900 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-coffee-600 text-sm max-w-xs mb-5">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
