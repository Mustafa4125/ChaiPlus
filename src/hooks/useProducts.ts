import { useEffect, useState } from 'react';
import { getProductsFromFirestore } from '@/services/firebase/products';
import { products as mockProducts } from '@/services/appDataService';
import type { Product } from '@/types';

// Loads live products from Firestore (admin-managed) and falls back to the bundled mock catalog when unavailable.
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getProductsFromFirestore()
      .then((data) => {
        if (!cancelled && data.length > 0) {
          setProducts(data.filter((product) => product.isActive !== false));
        }
      })
      .catch(() => {
        // keep mock fallback
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categories = ['Tümü', ...Array.from(new Set(products.map((p) => p.category)))];

  return { products, categories, loading };
};
