import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export function Input({ label, error, icon, endAdornment, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>}
        <input
          className={cn(
            'w-full h-14 px-4 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10',
            'text-gray-900 dark:text-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all',
            icon && 'pl-12',
            endAdornment && 'pr-12',
            error && 'border-red-400 focus:ring-red-400/30',
            className,
          )}
          {...props}
        />
        {endAdornment && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{endAdornment}</div>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
