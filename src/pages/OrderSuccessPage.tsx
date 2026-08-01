import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, ClipboardList, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { useBalanceStore } from '@/store/balance';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const balance = useBalanceStore((s) => s.balance);
  const state = location.state as { total?: number; spent?: number; previousBalance?: number; remainingBalance?: number } | undefined;
  const spent = state?.spent ?? 0;
  const previousBalance = state?.previousBalance ?? balance + spent;
  const remainingBalance = state?.remainingBalance ?? Math.max(0, balance);

  useEffect(() => {
    const timer = setTimeout(() => {}, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface-dark flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <CheckCircle className="h-16 w-16 text-primary" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center"
      >
        Siparişiniz Alındı!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-gray-500 text-center mb-2"
      >
        Siparişiniz mutfağa iletildi.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-sm text-primary font-semibold mb-6"
      >
        Tahmini teslimat: ~20 dakika
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-4 shadow-soft dark:border-white/5 dark:bg-[#22262e] mb-6"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Marka Bakiye Durumu</p>
            <p className="text-xs text-gray-500">Sipariş sonrası güncel bakiye</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Eski Marka</span>
            <span>{formatPrice(previousBalance)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Harcanan Marka</span>
            <span className="text-red-500">-{formatPrice(spent)}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 dark:text-white">
            <span>Kalan Marka</span>
            <span className="text-primary">{formatPrice(remainingBalance)}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="w-full max-w-sm space-y-3"
      >
        <Button fullWidth size="lg" onClick={() => navigate('/orders')}>
          <ClipboardList className="h-5 w-5" />
          Siparişlerimi Gör
        </Button>
        <Button fullWidth size="lg" variant="secondary" onClick={() => navigate('/home')}>
          <Home className="h-5 w-5" />
          Ana Sayfaya Dön
        </Button>
      </motion.div>
    </div>
  );
}
