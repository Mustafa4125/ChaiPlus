import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';
import { extraPrice, sizePriceModifier } from '@/services/appDataService';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: CartItem['size'], extras: string[], note?: string) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function itemUnitPrice(item: CartItem): number {
  return item.product.price + (sizePriceModifier[item.size] ?? 0) + item.extras.length * extraPrice;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, extras, note) => {
        const normalizedExtras = [...extras].sort();
        const normalizedNote = note ?? '';

        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.size === size &&
              item.extras.join('|') === normalizedExtras.join('|') &&
              (item.note ?? '') === normalizedNote,
          );

          if (existingIndex >= 0) {
            return {
              items: state.items.map((item, index) =>
                index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item,
              ),
            };
          }

          return {
            items: [...state.items, { product, quantity: 1, size, extras: normalizedExtras, note }],
          };
        });
      },
      removeItem: (index) => {
        set((state) => ({ items: state.items.filter((_, i) => i !== index) }));
      },
      updateQuantity: (index, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((item, i) => (i === index ? { ...item, quantity } : item)),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, item) => sum + itemUnitPrice(item) * item.quantity, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    { name: 'chaiplus-cart' },
  ),
);

export { itemUnitPrice };
