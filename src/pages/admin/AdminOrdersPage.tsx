import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDateTime, orderStatusLabels, orderStatusColors } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useToastStore } from '@/store/toast';
import { subscribeToOrders, updateOrderStatusInFirestore } from '@/services/firebase/orders';
import type { Order, OrderStatus } from '@/types';

const statusFilters: (OrderStatus | 'all')[] = ['all', 'pending', 'preparing', 'yolda', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const loading = useSimulatedLoading(800);
  const addToast = useToastStore((s) => s.addToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const previousOrderIds = useRef<string[]>([]);

  useEffect(() => {
    
    const unsubscribe = subscribeToOrders(undefined, setOrders, (error) => {
      const message = error instanceof Error ? error.message : 'Siparişler yüklenemedi.';
      addToast(message, 'error');
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
  if (orders.length === 0) return;

  // İlk yüklemede mevcut siparişleri hafızaya al
  if (previousOrderIds.current.length === 0) {
    previousOrderIds.current = orders.map((o) => o.id);
    return;
  }

  // Sonradan gelen yeni siparişleri bul
  const newOrders = orders.filter(
    (o) => !previousOrderIds.current.includes(o.id)
  );

  if (newOrders.length > 0) {
    const newest = newOrders[0];

    // Bildirim
    new Notification("☕ Yeni Sipariş!", {
      body: newest.items
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(", "),
      icon: "/icon-192.png",
    });

    addToast("☕ Yeni sipariş geldi!", "success");
  }

  previousOrderIds.current = orders.map((o) => o.id);
}, [orders, addToast]);

  useEffect(() => {
  if (orders.length === 0) return;

  // İlk açılışta mevcut siparişleri hafızaya al
  if (previousOrderIds.current.length === 0) {
    previousOrderIds.current = orders.map((o) => o.id);
    return;
  }

  // Yeni gelen siparişleri bul
  const newOrders = orders.filter(
    (o) => !previousOrderIds.current.includes(o.id)
  );

  if (newOrders.length > 0) {
    const newest = newOrders[0];

    // Bildirim göster
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("☕ Yeni Sipariş", {
        body: `${newest.items
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(", ")}`,
        icon: "/icon-192.png",
      });
    }

    // Ses çal
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch {}

    // Titreşim
    if ("vibrate" in navigator) {
      navigator.vibrate([300, 200, 300]);
    }

    addToast("☕ Yeni sipariş geldi!", "success");
  }

  previousOrderIds.current = orders.map((o) => o.id);
}, [orders, addToast]);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === 'all' || o.status === filter;
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      const order = orders.find((item) => item.id === id);
      await updateOrderStatusInFirestore(id, status, order?.userId);
      addToast(`${id} → ${orderStatusLabels[status]}`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Durum güncellenemedi.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sipariş Yönetimi</h1>
        <p className="text-sm text-gray-500">{orders.length} sipariş</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Sipariş ara..."
          className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-[#22262e] border border-gray-100 dark:border-white/5 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              filter === s ? 'bg-primary text-white' : 'bg-white dark:bg-[#22262e] text-gray-600 shadow-soft',
            )}
          >
            {s === 'all' ? 'Tümü' : orderStatusLabels[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((order, i) => (
          <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-medium', orderStatusColors[order.status])}>
                  {orderStatusLabels[order.status]}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(', ')}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                <div className="flex gap-2">
                  {order.status === 'pending' && (
                    <Button size="sm" onClick={() => void updateStatus(order.id, 'preparing')}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Onayla
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" variant="gold" onClick={() => void updateStatus(order.id, 'yolda')}>
                      Yola Çıkar
                    </Button>
                  )}
                  {order.status === 'yolda' && (
                    <Button size="sm" onClick={() => void updateStatus(order.id, 'delivered')}>
                      <CheckCircle className="h-3.5 w-3.5" />
                      Teslim Et
                    </Button>
                  )}
                  {(order.status === 'pending' || order.status === 'preparing' || order.status === 'yolda') && (
                    <Button size="sm" variant="ghost" onClick={() => void updateStatus(order.id, 'cancelled')}>
                      <XCircle className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
