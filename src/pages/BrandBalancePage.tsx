import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/lib/utils';
import { useBalanceStore } from '@/store/balance';
import { useAuthStore } from '@/store/auth';

export default function BrandBalancePage() {
  const loading = useSimulatedLoading(600);
  const balance = useBalanceStore((s) => s.balance);
  const transactions = useBalanceStore((s) => s.transactions);
  const user = useAuthStore((s) => s.user);
  const hydrate = useBalanceStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Marka Bakiyesi" showBack />
        <div className="px-5 space-y-4">
          <Skeleton className="h-40 w-full" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Marka Bakiyesi" subtitle={user?.name ?? 'Kullanıcı'} showBack />

      <div className="px-5 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card glass className="bg-gradient-to-br from-primary to-primary-dark text-white border-0">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <p className="text-white/70 text-sm">Mevcut Marka</p>
                <p className="text-4xl font-bold">{formatPrice(balance)}</p>
              </div>
            </div>
            <p className="text-white/60 text-xs">Son güncelleme: {formatDate(new Date().toISOString().slice(0, 10))}</p>
          </Card>
        </motion.div>

        <div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">İşlem Geçmişi</h2>
          <div className="space-y-3">
            {transactions.map((tx, i) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="flex items-center gap-4 py-4">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                      tx.type === 'credit' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-red-100 text-red-500 dark:bg-red-900/30'
                    }`}
                  >
                    {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{tx.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatPrice(tx.amount)}
                  </span>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
