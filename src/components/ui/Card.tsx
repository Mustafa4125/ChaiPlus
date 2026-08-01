import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, glass, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-3xl p-5 shadow-soft transition-all duration-300',
        glass
          ? 'bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-white/20 dark:border-white/10'
          : 'bg-white dark:bg-[#22262e]',
        hover && 'hover:shadow-soft-lg hover:-translate-y-0.5 cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}
