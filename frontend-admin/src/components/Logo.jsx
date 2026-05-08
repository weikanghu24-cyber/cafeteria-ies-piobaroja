import { cn } from '@/utils/cn';

export function Logo({ className, variant = 'full' }) {
  if (variant === 'icon') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <CupIcon className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <CupIcon className="w-10 h-10 shrink-0" />
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base font-semibold text-coffee-900 tracking-tight">
            Cafetería
          </span>
          <span className="bg-accent text-white text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded">
            Admin
          </span>
        </div>
        <span className="font-body text-[10px] font-bold uppercase tracking-[0.18em] text-coffee-500">
          IES Pío Baroja
        </span>
      </div>
    </div>
  );
}

function CupIcon({ className }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="12" fill="#3d2817" />
      <path
        d="M13 14 L13 24 Q13 27.5 16.5 27.5 L22.5 27.5 Q26 27.5 26 24 L26 14 Z"
        fill="none"
        stroke="#f5ede0"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M26 16.5 Q29.5 16.5 29.5 20 Q29.5 23 26 23"
        fill="none"
        stroke="#f5ede0"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M16 9 Q17.5 11.5 16 13.5" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M19.5 8 Q21 10.5 19.5 13" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M23 9 Q24.5 11.5 23 13.5" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
