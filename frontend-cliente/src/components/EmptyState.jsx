import { cn } from '@/utils/cn';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center py-16 px-6',
      className
    )}>
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-coffee-500" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-coffee-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-coffee-600 text-sm max-w-xs mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
