import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { brandBalance as initialBrandBalance } from '@/services/appDataService';
import { deductBalanceForOrder, getBalanceForUser, topUpCustomerBalance } from '@/services/firebase/balance';
import type { BrandBalance, BrandTransaction } from '@/types';
import { useAuthStore } from '@/store/auth';

interface BalanceState extends BrandBalance {
  loading: boolean;
  hydrate: () => Promise<void>;
  setBalance: (balance: number) => void;
  deduct: (amount: number, description: string, date?: string) => Promise<{ oldBalance: number; newBalance: number }>;
  topUp: (amount: number, description: string, date?: string) => Promise<{ oldBalance: number; newBalance: number }>;
}

const initialState: BrandBalance = {
  customerName: initialBrandBalance.customerName,
  balance: initialBrandBalance.balance,
  currency: initialBrandBalance.currency,
  lastTopUp: initialBrandBalance.lastTopUp,
  transactions: initialBrandBalance.transactions as BrandTransaction[],
};

export const useBalanceStore = create<BalanceState>()(
  persist(
    (set, get) => ({
      ...initialState,
      loading: false,
      hydrate: async () => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
          set({ ...initialState, loading: false });
          return;
        }

        set({ loading: true });
        const fresh = await getBalanceForUser(user.id);
        set({ ...fresh, loading: false });
      },
      setBalance: (balance) => set({ balance }),
      deduct: async (amount, description, date = new Date().toISOString().slice(0, 10)) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
          return { oldBalance: get().balance, newBalance: get().balance };
        }

        const oldBalance = get().balance;
        const result = await deductBalanceForOrder({
          userId: user.id,
          amount,
          description,
          actorId: user.id,
          actorRole: user.role,
        });

        const fresh = await getBalanceForUser(user.id);
        set({ ...fresh, loading: false });
        return { oldBalance, newBalance: result.balance };
      },
      topUp: async (amount, description, date = new Date().toISOString().slice(0, 10)) => {
        const user = useAuthStore.getState().user;
        if (!user?.id) {
          return { oldBalance: get().balance, newBalance: get().balance };
        }

        const oldBalance = get().balance;
        const result = await topUpCustomerBalance({
          customerId: user.id,
          amount,
          description,
          actorId: useAuthStore.getState().user?.id ?? 'admin',
          actorRole: 'admin',
        });

        const fresh = await getBalanceForUser(user.id);
        set({ ...fresh, loading: false });
        return { oldBalance, newBalance: result.balance };
      },
    }),
    { name: 'chaiplus-balance' },
  ),
);
