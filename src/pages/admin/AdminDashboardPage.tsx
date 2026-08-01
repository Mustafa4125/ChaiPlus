import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  ArrowUpRight,
  Package,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { orderStatusLabels, orderStatusColors } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { subscribeToOrders } from '@/services/firebase/orders';
import { getAllUsersProfiles } from '@/services/firebase/users';
import type { Order } from '@/types';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToOrders(undefined, (liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
    });

    getAllUsersProfiles()
      .then((profiles) => setCustomerCount(profiles.filter((p) => p.role === 'customer').length))
      .catch(() => setCustomerCount(0));

    return unsubscribe;
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.filter((o) => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(new Date().toISOString().slice(0, 10))).length;
  const recentOrders = orders.slice(0, 4);

  const statCards = [
    { label: 'Toplam Sipariş', value: totalOrders.toLocaleString('tr-TR'), icon: ShoppingBag, color: 'bg-primary/10 text-primary' },
    { label: 'Toplam Gelir', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'bg-gold/10 text-gold' },
    { label: 'Aktif Müşteri', value: customerCount.toString(), icon: Users, color: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20' },
    { label: 'Bekleyen Sipariş', value: pendingOrders.toString(), icon: Clock, color: 'bg-red-50 text-red-500 dark:bg-red-900/20' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500">Çay ocağı yönetim paneli · Bugün {todayOrders} sipariş</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${stat.color} mb-3`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-gray-300" />
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Son Siparişler</h2>
          <span className="text-xs text-gray-400">{totalOrders} toplam sipariş</span>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">Henüz sipariş yok.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 py-2 border-b border-gray-50 dark:border-white/5 last:border-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface dark:bg-white/5">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{order.customerName ?? order.id}</p>
                  <p className="text-xs text-gray-400">{order.items.length} ürün</p>
                </div>
                <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-medium', orderStatusColors[order.status])}>
                  {orderStatusLabels[order.status]}
                </span>
                <span className="font-semibold text-sm text-primary">{formatPrice(order.total)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
