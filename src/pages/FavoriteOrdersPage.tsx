import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { ListItemSkeleton } from '@/components/ui/Skeleton';
import { formatPrice } from '@/lib/utils';
import { useToastStore } from '@/store/toast';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cart';
import { useFavoritesStore } from '@/store/favorites';
import { addOrderItemsToCart } from '@/lib/orderUtils';
import { useAuthStore } from '@/store/auth';
import { createFavoriteOrderInFirestore, deleteFavoriteOrderFromFirestore, subscribeToFavoriteOrders, updateFavoriteOrderNameInFirestore } from '@/services/firebase/favorites';
import type { FavoriteOrder } from '@/types';

export default function FavoriteOrdersPage() {
  const loading = useSimulatedLoading(700);
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const { favorites, setFavorites, removeFavorite, updateFavoriteName } = useFavoritesStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');

  useEffect(() => {
    if (!user?.id) {
      setFavorites([]);
      return;
    }

    const unsubscribe = subscribeToFavoriteOrders(user.id, setFavorites);
    return unsubscribe;
  }, [setFavorites, user?.id]);

  const favoriteList = useMemo(() => favorites, [favorites]);

  const reorder = (order: FavoriteOrder) => {
    addOrderItemsToCart(order.items, addItem);
    addToast(`"${order.name}" sepete eklendi!`, 'success');
    navigate('/cart');
  };

  const startEdit = (favorite: FavoriteOrder) => {
    setEditingId(favorite.id);
    setDraftName(favorite.name);
  };

  const saveEdit = async (id: string) => {
    const nextName = draftName.trim();
    if (!nextName) return;

    try {
      await updateFavoriteOrderNameInFirestore(id, nextName);
      updateFavoriteName(id, nextName);
      setEditingId(null);
      setDraftName('');
      addToast('Favori adı güncellendi.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Favori adı güncellenemedi.', 'error');
    }
  };

  const saveAsFavorite = async (order: FavoriteOrder) => {
    if (!user?.id) {
      addToast('Favori kaydetmek için giriş yapmalısınız.', 'error');
      return;
    }

    const name = prompt('Favori sipariş için bir isim girin', order.name || 'Favori Sipariş');
    const finalName = name?.trim();
    if (!finalName) return;

    try {
      const created = await createFavoriteOrderInFirestore({
        userId: user.id,
        name: finalName,
        items: order.items,
        total: order.total,
      });

      setFavorites([created, ...favorites.filter((item) => item.id !== created.id)]);
      addToast('Favori sipariş kaydedildi.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Favori kaydedilemedi.', 'error');
    }
  };

  const deleteFavorite = async (id: string) => {
    try {
      await deleteFavoriteOrderFromFirestore(id);
      removeFavorite(id);
      addToast('Favori kaldırıldı.', 'info');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Favori kaldırılamadı.', 'error');
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Favori Siparişler" showBack />
        <div className="px-5 space-y-3">
          {[1, 2, 3].map((i) => (
            <ListItemSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Favori Siparişler" subtitle="Hızlı tekrar sipariş" showBack />

      <div className="px-5 space-y-4">
        {favoriteList.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Heart className="h-10 w-10 text-red-300" />
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">Henüz favori sipariş yok</h3>
              <p className="mt-1 text-sm text-gray-500">Sık sipariş verdiğiniz ürünleri kaydedip tek tıklamayla tekrar edebilirsiniz.</p>
            </div>
          </Card>
        ) : (
          favoriteList.map((order, i) => (
            <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card>
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20 shrink-0">
                    <Heart className="h-6 w-6 text-red-400 fill-red-400" />
                  </div>
                  <div className="flex-1">
                    {editingId === order.id ? (
                      <input
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        className="w-full rounded-xl border border-gray-100 bg-white px-3 py-2 text-sm shadow-soft outline-none focus:ring-2 focus:ring-primary/20 dark:border-white/5 dark:bg-[#22262e]"
                        placeholder="Favori adı girin"
                      />
                    ) : (
                      <h3 className="font-semibold text-gray-900 dark:text-white">{order.name}</h3>
                    )}
                    <p className="text-xs text-gray-400">{order.orderCount} kez sipariş edildi</p>
                  </div>
                  <span className="font-bold text-primary">{formatPrice(order.total)}</span>
                </div>

                <div className="space-y-2 mb-4 pl-1">
                  {order.items.map((item, j) => (
                    <div key={`${item.productId}-${j}`} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                      <span>{item.quantity}x {item.name} ({item.size})</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button fullWidth size="md" onClick={() => reorder(order)}>
                    <ShoppingCart className="h-4 w-4" />
                    Tekrar Sipariş
                  </Button>
                  {editingId === order.id ? (
                    <Button variant="secondary" size="md" onClick={() => void saveEdit(order.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="secondary" size="md" onClick={() => startEdit(order)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="md" onClick={() => void deleteFavorite(order.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
