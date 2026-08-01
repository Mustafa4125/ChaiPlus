import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore, itemUnitPrice } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { formatPrice } from '@/lib/utils';
import { useBalanceStore } from '@/store/balance';
import { useAuthStore } from '@/store/auth';
import { createOrderInFirestore } from '@/services/firebase/orders';

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const balance = useBalanceStore((s) => s.balance);
  const hydrateBalance = useBalanceStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const total = getTotal();
  const canAfford = total <= balance;

  const handleCheckout = async () => {
    if (!user?.id) {
      addToast('Giriş yapılmadı.', 'error');
      return;
    }

    if (!canAfford) {
      addToast('Yetersiz marka bakiyesi. Sipariş oluşturulamadı.', 'error');
      return;
    }

    const previousBalance = balance;
    setLoading(true);
    try {
      const order = await createOrderInFirestore({
        userId: user.id,
        customerName: user.name,
        items: items.map((item) => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: itemUnitPrice(item),
          size: item.size,
          extras: item.extras,
        })),
        total,
      });

      clearCart();
      await hydrateBalance();
      addToast('Siparişiniz alındı!', 'success');
      navigate('/order-success', {
        state: {
          total,
          spent: total,
          previousBalance,
          remainingBalance: Math.max(0, previousBalance - total),
          orderId: order.id,
        },
      });
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Sipariş oluşturulamadı.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div>
        <PageHeader title="Sepet" />
        <EmptyState
          icon={ShoppingBag}
          title="Sepetiniz şu an boş"
          description="Çay ocağımızın en çok tercih edilen içeceklerini seçip, hızlıca sipariş hazırlamaya başlayabilirsiniz."
          actionLabel="Ürünleri Keşfet"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="pb-36">
      <PageHeader title="Sepet" subtitle={`${items.length} ürün`} />

      <div className="px-5 space-y-3">
        {items.map((item, index) => (
          <motion.div
            key={`${item.product.id}-${index}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="flex gap-4">
              <img src={item.product.image} alt={item.product.name} className="h-20 w-20 rounded-2xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{item.product.name}</h3>
                <p className="text-xs text-gray-400">{[item.size, item.extras.join(', ')].filter(Boolean).join(' · ')}</p>
                <p className="text-primary font-bold mt-1">{formatPrice(itemUnitPrice(item))}</p>
                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface dark:bg-white/5"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-semibold text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface dark:bg-white/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-500 self-start p-1">
                <Trash2 className="h-4 w-4" />
              </button>
            </Card>
          </motion.div>
        ))}

        <Card glass className="mt-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Ara Toplam</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Kalan Marka</span>
              <span className="text-primary">{formatPrice(Math.max(0, balance - total))}</span>
            </div>
            <div className="border-t border-gray-100 dark:border-white/10 pt-2 flex justify-between font-bold text-base">
              <span>Toplam</span>
              <span className="text-primary">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 pt-1">
              <span>Mevcut Marka</span>
              <span className={canAfford ? 'text-green-600' : 'text-red-500'}>
                {formatPrice(balance)} {canAfford ? '✓' : '(Yetersiz)'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
        <div className="mx-auto max-w-lg">
          <Button fullWidth size="lg" loading={loading} disabled={!canAfford} onClick={handleCheckout}>
            Siparişi Onayla — {formatPrice(total)}
          </Button>
        </div>
      </div>
    </div>
  );
}
