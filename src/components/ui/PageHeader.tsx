import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

export function PageHeader({ title, subtitle, showBack, backTo, rightAction, transparent }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'sticky top-0 z-40 px-5 pt-4 pb-3',
        !transparent && 'bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-xl',
      )}
    >
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white dark:bg-white/10 shadow-soft hover:scale-105 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{subtitle}</p>}
        </div>
        {rightAction}
      </div>
    </motion.header>
  );
}
