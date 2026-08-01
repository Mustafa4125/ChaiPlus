import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const variants = {
  primary: 'bg-primary text-white hover:bg-primary-light shadow-soft active:scale-[0.98]',
  secondary: 'bg-cream text-primary hover:bg-cream/80 dark:bg-white/10 dark:text-cream border border-primary/10',
  ghost: 'bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-foreground',
  gold: 'bg-gold text-white hover:bg-gold-light shadow-gold active:scale-[0.98]',
  outline: 'border-2 border-primary text-primary hover:bg-primary/5 bg-white/70 dark:bg-[#22262e]/70',
};

const sizes = {
  sm: 'h-10 px-4 text-sm rounded-xl',
  md: 'h-12 px-6 text-base rounded-2xl',
  lg: 'h-14 px-8 text-lg rounded-2xl font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, loading, children, disabled, ...props }, ref) => (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...(props as object)}
    >
      {loading ? (
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        children
      )}
    </motion.button>
  ),
);

Button.displayName = 'Button';
