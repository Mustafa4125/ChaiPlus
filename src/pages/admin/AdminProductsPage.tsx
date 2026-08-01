import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Sparkles, Pencil, Trash2, Plus, EyeOff, Eye, Tag } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToastStore } from '@/store/toast';
import { createProductInFirestore, deleteProductFromFirestore, getProductsFromFirestore, toggleProductActiveStatus, updateProductInFirestore } from '@/services/firebase/products';
import type { Product } from '@/types';

const defaultForm = {
  name: '',
  description: '',
  price: '0',
  category: 'Çay',
  image: '',
  prepTime: '10 dk',
  isPopular: false,
};

export default function AdminProductsPage() {
  const addToast = useToastStore((s) => s.addToast);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  const loadProducts = async () => {
    try {
      const data = await getProductsFromFirestore();
      setProducts(data);
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ürünler yüklenemedi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      addToast('Ürün adı zorunludur.', 'warning');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price || 0),
        category: form.category,
        image: form.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop',
        prepTime: form.prepTime,
        isPopular: form.isPopular,
        isActive: true,
      };

      if (editingId) {
        await updateProductInFirestore(editingId, payload);
        addToast('Ürün güncellendi.', 'success');
      } else {
        await createProductInFirestore(payload);
        addToast('Ürün eklendi.', 'success');
      }

      resetForm();
      await loadProducts();
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ürün kaydedilemedi.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      image: product.image,
      prepTime: product.prepTime,
      isPopular: Boolean(product.isPopular),
    });
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
      await deleteProductFromFirestore(productId);
      await loadProducts();
      addToast('Ürün silindi.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ürün silinemedi.', 'error');
    }
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await toggleProductActiveStatus(product.id, !(product.isActive ?? true));
      await loadProducts();
      addToast(product.isActive === false ? 'Ürün aktif edildi.' : 'Ürün pasif yapıldı.', 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Ürün durumu değiştirilemedi.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-60 w-full" />
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ürün Yönetimi</h1>
        <p className="text-sm text-gray-500">Ürün ekleyin, düzenleyin ve Firestore ile yönetin.</p>
      </div>

      <Card className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Ürün düzenle' : 'Yeni ürün ekle'}</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Ürün adı" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Limonata" />
          <Input label="Kategori" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Çay" />
          <Input label="Fiyat (Marka)" type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} placeholder="5" />
          <Input label="Hazırlama süresi" value={form.prepTime} onChange={(e) => setForm((prev) => ({ ...prev, prepTime: e.target.value }))} placeholder="10 dk" />
          <Input label="Resim URL" value={form.image} onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))} placeholder="https://..." />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Açıklama</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Ürün açıklaması"
          />
        </div>

        <label className="mt-4 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={form.isPopular}
            onChange={(e) => setForm((prev) => ({ ...prev, isPopular: e.target.checked }))}
          />
          Popüler ürün olarak işaretle
        </label>

        <div className="mt-5 flex gap-3">
          <Button onClick={handleSubmit} loading={saving}>{editingId ? 'Güncelle' : 'Ekle'}</Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>İptal</Button>
          )}
        </div>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {products.map((product, index) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card className="flex items-start gap-3 p-4">
              <img src={product.image} alt={product.name} className="h-16 w-16 rounded-2xl object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                  <Badge variant={product.isActive === false ? 'muted' : 'primary'}>
                    {product.isActive === false ? 'Pasif' : 'Aktif'}
                  </Badge>
                  {product.isPopular && (
                    <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                      <Sparkles className="mr-1 inline h-3 w-3" />
                      Popüler
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-500">{product.category}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{product.description}</p>
                <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                  <span className="font-semibold text-primary">{product.price} Marka</span>
                  <span className="text-gray-500">{product.prepTime}</span>
                </div>
              </div>
            </Card>

            <div className="mt-2 grid grid-cols-4 gap-2">
              <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleToggleActive(product)}>
                {product.isActive === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => {
                const nextPrice = Number(prompt(`Yeni fiyatı girin (${product.name})`, String(product.price)) ?? product.price);
                if (!Number.isFinite(nextPrice) || nextPrice < 0) {
                  addToast('Geçerli bir fiyat girin.', 'warning');
                  return;
                }
                void updateProductInFirestore(product.id, { price: nextPrice }).then(async () => {
                  await loadProducts();
                  addToast('Fiyat güncellendi.', 'success');
                }).catch((error) => addToast(error instanceof Error ? error.message : 'Fiyat güncellenemedi.', 'error'));
              }}>
                <Tag className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
