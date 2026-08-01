import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coins, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { subscribeToOrders } from '@/services/firebase/orders';
import type { Order } from '@/types';

export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(undefined, (liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dailyEarned = orders.filter((o) => o.createdAt.startsWith(today)).reduce((sum, o) => sum + o.total, 0);

  const productCounts = new Map<string, number>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      productCounts.set(item.name, (productCounts.get(item.name) ?? 0) + item.quantity);
    });
  });
  const bestSelling = [...productCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '-';

  const reportItems = [
    { label: 'Günlük kazanılan marka', value: formatPrice(dailyEarned), icon: Coins },
    { label: 'En çok satılan ürün', value: bestSelling, icon: TrendingUp },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Raporlar</h1>
        <p className="text-sm text-gray-500">İşletme performansını takip edin.</p>
      </div>

      {loading ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {reportItems.map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
              <Card className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>
                  <p className="mt-1 font-semibold text-gray-900 dark:text-white">{item.value}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
