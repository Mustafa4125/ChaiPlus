import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
        <Icon className="h-10 w-10 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed mb-6">{description}</p>}
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
