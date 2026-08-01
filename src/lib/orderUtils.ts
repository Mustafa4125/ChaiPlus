import { products } from '@/services/appDataService';
import type { CartItem, OrderItem, Product } from '@/types';

export type CartAddHandler = (product: Product, size: CartItem['size'], extras: string[], note?: string) => void;

export function addOrderItemsToCart(
  items: OrderItem[],
  addItem: CartAddHandler,
  fallbackSize: CartItem['size'] = 'Orta',
  fallbackExtras: string[] = [],
) {
  items.forEach((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return;

    const normalizedSize = item.size || fallbackSize;
    const normalizedExtras = item.extras?.length ? item.extras : fallbackExtras;

    for (let index = 0; index < item.quantity; index += 1) {
      addItem(product, normalizedSize, normalizedExtras);
    }
  });
}
