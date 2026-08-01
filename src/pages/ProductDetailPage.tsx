import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, Flame, Minus, Plus, ShoppingCart, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { sizePriceModifier, extraPrice } from '@/services/appDataService';
import { getProductOptions } from '@/lib/productOptions';
import { useProducts } from '@/hooks/useProducts';
import { getProductReviews, submitProductReview } from '@/services/firebase/reviews';
import { formatPrice, formatDateTime, cn } from '@/lib/utils';
import { useCartStore } from '@/store/cart';
import { useToastStore } from '@/store/toast';
import { useAuthStore } from '@/store/auth';
import type { ProductReview } from '@/types';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);
  const addItem = useCartStore((s) => s.addItem);
  const addToast = useToastStore((s) => s.addToast);
  const authUser = useAuthStore((s) => s.user);

  const [size, setSize] = useState('');
  const [extras, setExtras] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const options = product ? getProductOptions(product.name) : null;

  useEffect(() => {
    if (!options) return;
    setSize(options.sizeOptions[0] ?? '');
    setExtras(options.extraSelectionMode === 'single' && options.extraOptions[0] ? [options.extraOptions[0]] : []);
  }, [product?.id]);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    getProductReviews(product.id)
      .then((data) => {
        if (cancelled) return;
        setReviews(data);
        const mine = data.find((review) => review.userId === authUser?.id);
        setMyRating(mine?.rating ?? 0);
        setMyComment(mine?.comment ?? '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [product?.id, authUser?.id]);

  if (!product || !options) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
        <p className="text-gray-500 mb-4">Ürün bulunamadı</p>
        <Button onClick={() => navigate('/products')}>Ürünlere Dön</Button>
      </div>
    );
  }

  const unitPrice = product.price + (sizePriceModifier[size] ?? 0) + extras.length * extraPrice;
  const totalPrice = unitPrice * quantity;

  const toggleExtra = (extra: string) => {
    if (options.extraSelectionMode === 'single') {
      setExtras([extra]);
      return;
    }
    setExtras((prev) => (prev.includes(extra) ? prev.filter((e) => e !== extra) : [...prev, extra]));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, size, extras);
    }
    addToast(`${product.name} sepete eklendi`, 'success');
    navigate('/cart');
  };

  const handleSubmitReview = async () => {
    if (!authUser?.id) {
      addToast('Yorum yapmak için giriş yapmalısınız.', 'error');
      return;
    }
    if (myRating < 1) {
      addToast('Lütfen bir puan seçin.', 'warning');
      return;
    }

    setSubmittingReview(true);
    try {
      await submitProductReview({
        productId: product.id,
        userId: authUser.id,
        customerName: authUser.name,
        rating: myRating,
        comment: myComment,
      });
      const fresh = await getProductReviews(product.id);
      setReviews(fresh);
      addToast('Yorumunuz kaydedildi.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Yorum kaydedilemedi.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="pb-32">
      <PageHeader title="" showBack transparent />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="relative h-72 overflow-hidden">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5">
            <div className="flex gap-2 mb-2">
              {product.tags?.map((tag) => (
                <Badge key={tag} variant={tag === 'Popüler' ? 'gold' : 'default'}>
                  {tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-2xl font-bold text-white">{product.name}</h1>
          </div>
        </div>
      </motion.div>

      <div className="px-5 -mt-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#22262e] rounded-3xl shadow-soft-lg p-5 space-y-5"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-semibold">{product.rating || '-'}</span>
              {(product.ratingCount ?? 0) > 0 && (
                <span className="text-xs text-gray-400">({product.ratingCount} değerlendirme)</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Clock className="h-4 w-4" />
              {product.prepTime}
            </div>
            {product.calories && (
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Flame className="h-4 w-4" />
                {product.calories} kcal
              </div>
            )}
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{product.description}</p>

          {options.sizeOptions.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3">{options.sizeLabel}</p>
              <div className="flex gap-2">
                {options.sizeOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={cn(
                      'flex-1 py-3 rounded-2xl text-sm font-medium transition-all',
                      size === s
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-surface dark:bg-white/5 text-gray-600 dark:text-gray-400',
                    )}
                  >
                    {s}
                    {sizePriceModifier[s] ? (
                      <span className="block text-xs opacity-70">
                        {sizePriceModifier[s] > 0 ? '+' : ''}{sizePriceModifier[s]} Marka
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}

          {options.extraOptions.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3">{options.extraLabel}</p>
              <div className="flex flex-wrap gap-2">
                {options.extraOptions.map((extra) => (
                  <button
                    key={extra}
                    onClick={() => toggleExtra(extra)}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-all',
                      extras.includes(extra)
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'bg-surface dark:bg-white/5 text-gray-600 dark:text-gray-400',
                    )}
                  >
                    {extra}{extraPrice > 0 ? ` +${extraPrice} Marka` : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Adet</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface dark:bg-white/5"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold w-6 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface dark:bg-white/5"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-5 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#22262e] rounded-3xl shadow-soft-lg p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold">Değerlendirmeler</p>
          </div>

          {authUser && (
            <div className="space-y-3 border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} onClick={() => setMyRating(value)} aria-label={`${value} yıldız`}>
                    <Star className={cn('h-6 w-6', value <= myRating ? 'fill-gold text-gold' : 'text-gray-300 dark:text-gray-600')} />
                  </button>
                ))}
              </div>
              <textarea
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-3 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
              />
              <Button size="sm" loading={submittingReview} onClick={() => void handleSubmitReview()}>
                Yorumu Kaydet
              </Button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">Henüz yorum yok. İlk yorumu siz yapın!</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{review.customerName}</p>
                    <span className="text-xs text-gray-400">{formatDateTime(review.createdAt)}</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Star key={value} className={cn('h-3.5 w-3.5', value <= review.rating ? 'fill-gold text-gold' : 'text-gray-300 dark:text-gray-600')} />
                    ))}
                  </div>
                  {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-5 z-40">
        <div className="mx-auto max-w-lg">
          <Button fullWidth size="lg" variant="gold" onClick={handleAddToCart}>
            <ShoppingCart className="h-5 w-5" />
            Sepete Ekle — {formatPrice(totalPrice)}
          </Button>
        </div>
      </div>
    </div>
  );
}
