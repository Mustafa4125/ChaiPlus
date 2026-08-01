import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Package, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDateTime, orderStatusLabels, orderStatusColors } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { subscribeToOrders } from '@/services/firebase/orders';
import { addOrderItemsToCart } from '@/lib/orderUtils';

export default function OrdersPage() {
  const loading = useSimulatedLoading(700);
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (!user?.id) {
      setOrders([]);
      return;
    }

    const unsubscribe = subscribeToOrders(user.id, setOrders, (error) => {
      const message = error instanceof Error ? error.message : 'Siparişler yüklenemedi.';
      addToast(message, 'error');
    });
    return unsubscribe;
  }, [user?.id]);

  const filteredOrders =
    selectedStatus === 'all'
      ? orders
      : orders.filter((order) => order.status === selectedStatus);

  const reorderOrder = (order: Order) => {
    addOrderItemsToCart(order.items, addItem);
    addToast('Eski sipariş sepetinize eklendi. Güncel fiyatlar uygulanıyor.', 'success');
    navigate('/cart');
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Siparişlerim" />
        <div className="px-5 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Siparişlerim" subtitle={`${orders.length} sipariş`} />

      <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'preparing', 'yolda', 'delivered', 'cancelled'].map((status) => {
          const label = status === 'all' ? 'Tümü' : orderStatusLabels[status];
          const isActive = selectedStatus === status;

          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status as OrderStatus | 'all')}
              className={cn(
                'shrink-0 rounded-full px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-gray-600 shadow-soft dark:bg-[#22262e] dark:text-gray-400',
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="px-5 space-y-3 pb-4">
        {filteredOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card hover onClick={() => navigate(`/orders/${order.id}`)} className="cursor-pointer">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{order.id}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      reorderOrder(order);
                    }}
                    className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tekrar Sipariş
                  </button>
                  <span className={cn('px-3 py-1 rounded-full text-xs font-medium', orderStatusColors[order.status])}>
                    {orderStatusLabels[order.status]}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                <Package className="h-4 w-4" />
                {order.items.length} ürün · {order.estimatedTime && `~${order.estimatedTime}`}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-400">Harcanan marka</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
