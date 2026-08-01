import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'gold' | 'primary' | 'muted';
  className?: string;
}

const variants = {
  default: 'bg-surface dark:bg-white/10 text-gray-700 dark:text-gray-300',
  gold: 'bg-gold/15 text-gold',
  primary: 'bg-primary/10 text-primary dark:text-primary-light',
  muted: 'bg-gray-100 dark:bg-white/5 text-gray-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center px-3 py-1 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
