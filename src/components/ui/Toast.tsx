import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToastStore } from '@/store/toast';
import { cn } from '@/lib/utils';
import type { ToastType } from '@/types';

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles: Record<ToastType, string> = {
  success: 'bg-gradient-to-r from-primary to-primary-dark text-white',
  error: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  info: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  warning: 'bg-gradient-to-r from-gold to-amber-500 text-white',
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={cn('flex items-center gap-3 px-4 py-3 rounded-2xl shadow-soft-lg border border-white/10 pointer-events-auto', styles[toast.type])}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <p className="flex-1 text-sm font-medium">{toast.message}</p>
              <button onClick={() => removeToast(toast.id)} className="opacity-70 hover:opacity-100">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
