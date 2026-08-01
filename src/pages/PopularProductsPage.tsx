import { PageHeader } from '@/components/ui/PageHeader';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { useSimulatedLoading } from '@/hooks/useSimulatedLoading';
import { useProducts } from '@/hooks/useProducts';

export default function PopularProductsPage() {
  const simulatedLoading = useSimulatedLoading(800);
  const { products, loading: productsLoading } = useProducts();
  const loading = simulatedLoading || productsLoading;
  const popular = products.filter((p) => p.isPopular);

  return (
    <div>
      <PageHeader title="Popüler Ürünler" subtitle="En çok tercih edilenler" showBack />

      <div className="px-5 grid grid-cols-2 gap-3 pb-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : popular.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
      </div>
    </div>
  );
}
