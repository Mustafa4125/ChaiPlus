import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { useProducts } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

export default function ProductsPage() {
  const simulatedLoading = useSimulatedLoading(900);
  const { products, categories, loading: productsLoading } = useProducts();
  const loading = simulatedLoading || productsLoading;
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => {
    const matchCat = activeCategory === 'Tümü' || p.category === activeCategory;
    const searchableText = `${p.name} ${p.description} ${p.tags?.join(' ')}`.toLowerCase();
    const matchSearch = searchableText.includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <PageHeader title="Ürünler" subtitle="Premium menü" />

      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            aria-label="Ürün ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white dark:bg-[#22262e] border border-gray-100 dark:border-white/5 shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-5 mb-5 flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === cat
                ? 'bg-primary text-white shadow-soft'
                : 'bg-white dark:bg-[#22262e] text-gray-600 dark:text-gray-400 shadow-soft',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="px-5 grid grid-cols-1 gap-3 pb-4 sm:grid-cols-2">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
        ) : filtered.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
              >
                <ProductCard product={product} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <div className="col-span-full rounded-3xl border border-dashed border-gray-200 bg-white/80 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-[#22262e]/70 dark:text-gray-400">
            Aradığınız kriterlere uygun ürün bulunamadı. Farklı bir kelime veya kategori deneyin.
          </div>
        )}
      </div>
    </div>
  );
}
