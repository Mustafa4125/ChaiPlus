import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatPrice, formatDateTime, orderStatusLabels, orderStatusColors } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { subscribeToOrders } from '@/services/firebase/orders';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { addOrderItemsToCart } from '@/lib/orderUtils';
import type { Order } from '@/types';

const statusSteps = ['pending', 'preparing', 'yolda', 'delivered'] as const;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToOrders(user.id, (orders) => {
      setOrder(orders.find((item) => item.id === id) ?? null);
    });

    return unsubscribe;
  }, [id, user?.id]);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="text-gray-500 mb-4">Sipariş bulunamadı</p>
        <Button onClick={() => navigate('/orders')}>Siparişlere Dön</Button>
      </div>
    );
  }

  const currentStep = statusSteps.indexOf(order.status as typeof statusSteps[number]);

  const reorderOrder = () => {
    addOrderItemsToCart(order.items, addItem);
    addToast('Eski sipariş sepetinize eklendi. Güncel fiyatlar uygulanıyor.', 'success');
    navigate('/cart');
  };

  return (
    <div className="pb-8">
      <PageHeader title="Sipariş Detayı" subtitle={order.id} showBack />

      <div className="px-5 space-y-5">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <div className="flex items-center justify-between mb-4">
              <span className={cn('px-3 py-1.5 rounded-full text-sm font-medium', orderStatusColors[order.status])}>
                {orderStatusLabels[order.status]}
              </span>
              <span className="text-sm text-gray-400">{formatDateTime(order.createdAt)}</span>
            </div>

            <div className="flex items-center justify-between mb-2">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div
                      className={cn(
                        'absolute top-3 right-1/2 w-full h-0.5 -translate-y-1/2',
                        i <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10',
                      )}
                      style={{ width: '100%', right: '50%' }}
                    />
                  )}
                  <div
                    className={cn(
                      'relative z-10 flex h-6 w-6 items-center justify-center rounded-full',
                      i <= currentStep ? 'bg-primary text-white' : 'bg-gray-200 dark:bg-white/10 text-gray-400',
                    )}
                  >
                    {i <= currentStep ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-xs">{i + 1}</span>}
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 text-center">{orderStatusLabels[step]}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="font-semibold">Sipariş İçeriği</h3>
            <Button variant="secondary" size="sm" onClick={reorderOrder}>
              <RotateCcw className="h-3.5 w-3.5" />
              Tekrar Sipariş
            </Button>
          </div>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{item.quantity}x {item.name}</p>
                  <p className="text-xs text-gray-400">{[item.size, item.extras.join(', ')].filter(Boolean).join(' · ')}</p>
                </div>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Harcanan Marka</span>
                <span>{formatPrice(order.total)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white">
                <span>Toplam</span>
                <span className="text-primary">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </Card>

        {order.estimatedTime && (
          <Card className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Tahmini Süre</p>
                <p className="text-sm text-gray-500">{order.estimatedTime}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
