import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Heart,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Coffee,
  RotateCcw,
  Clock3,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { ProductCard } from '@/components/ui/ProductCard';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/auth';
import { orders } from '@/services/appDataService';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { addOrderItemsToCart } from '@/lib/orderUtils';
import { useBalanceStore } from '@/store/balance';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const balance = useBalanceStore((s) => s.balance);
  const displayName = user?.name?.split(' ')[0] ?? 'Misafir';
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const { products } = useProducts();
  const popular = products.filter((p) => p.isPopular).slice(0, 4);
  const recentOrders = orders.slice(0, 3);

  const handleQuickTea = () => {
    const tea = products.find((product) => product.name === 'Çay');
    if (tea) {
      addItem(tea, 'Orta', []);
      addToast('1 Çay sepete eklendi.', 'success');
    }
  };

  const handleRepeatOrder = () => {
    const latestOrder = orders[0];
    if (!latestOrder) return;

    addOrderItemsToCart(latestOrder.items, addItem);
    addToast('Son sipariş tekrar sepete eklendi.', 'success');
  };

  return (
    <div className="px-5 pt-6 pb-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Merhaba,</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayName} 👋</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card
          glass
          className="mb-6 bg-gradient-to-br from-primary to-primary-dark text-white border-0 cursor-pointer"
          onClick={() => navigate('/brand-balance')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm mb-1">Marka Bakiyesi</p>
              <p className="text-3xl font-bold">{formatPrice(balance)}</p>
              <p className="text-white/60 text-xs mt-1">{user?.name ?? 'Müşteri'}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Wallet className="h-7 w-7" />
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 mb-8 sm:grid-cols-2">
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={handleQuickTea}
          className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-white dark:bg-[#22262e] shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Coffee className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white text-left">Hızlı Çay Siparişi</p>
            <p className="text-xs text-gray-500 mt-1">Tek dokunuşla 1 çay ekle</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/favorites')}
          className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-white dark:bg-[#22262e] shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-900/20">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white text-left">Favoriler</p>
            <p className="text-xs text-gray-500 mt-1">Sık tercih ettiklerin</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25 }}
          onClick={handleRepeatOrder}
          className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-white dark:bg-[#22262e] shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/10 text-gold">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white text-left">Tekrar Sipariş Ver</p>
            <p className="text-xs text-gray-500 mt-1">Son siparişi yeniden hazırla</p>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => navigate('/popular')}
          className="flex flex-col items-start gap-3 p-4 rounded-3xl bg-white dark:bg-[#22262e] shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-0.5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 dark:bg-blue-900/20">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white text-left">Popüler Ürünler</p>
            <p className="text-xs text-gray-500 mt-1">En çok tercih edilenler</p>
          </div>
        </motion.button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Popüler Ürünler</h2>
        </div>
        <button onClick={() => navigate('/popular')} className="flex items-center gap-1 text-sm text-primary font-medium">
          Tümü <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {popular.map((product, i) => (
          <ProductCard key={product.id} product={product} index={i} compact />
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6">
        <Card className="flex items-center gap-4 cursor-pointer" onClick={() => navigate('/products')}>
          <Badge variant="gold">Yeni</Badge>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 dark:text-white">Tüm menüyü keşfedin</p>
            <p className="text-xs text-gray-500">Çay ocağı menüsünü inceleyin</p>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Clock3 className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Son Siparişler</h2>
        </div>
        <div className="space-y-2">
          {recentOrders.map((order) => (
            <Card key={order.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{order.id}</p>
                <p className="text-xs text-gray-500">{order.items.length} ürün · {formatDateTime(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-primary">{formatPrice(order.total)}</p>
                <p className="text-[11px] text-gray-400">Harcanan marka</p>
                <Button size="sm" variant="ghost" className="mt-2" onClick={(e) => {
                  e.stopPropagation();
                  addOrderItemsToCart(order.items, addItem);
                  addToast('Sipariş yeniden sepete eklendi.', 'success');
                }}>
                  Tekrar Sipariş
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
