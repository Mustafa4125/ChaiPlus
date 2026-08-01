import { collection, doc, getDoc, getDocs, query, runTransaction, where } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';
import type { BrandBalance, BrandTransaction } from '@/types';
import { getUserProfileByUid } from '@/services/firebase/users';
import { createNotificationRecord } from '@/services/firebase/notifications';

const normalizeAmount = (value: number) => Number.isFinite(value) ? Number(value) : 0;

const toTransaction = (data: Record<string, unknown>, id: string): BrandTransaction => ({
  id,
  type: data.type === 'credit' ? 'credit' : 'debit',
  amount: normalizeAmount(Number(data.amount ?? 0)),
  description: String(data.description ?? 'Marka hareketi'),
  date: String(data.createdAt ?? data.date ?? new Date().toISOString().slice(0, 10)),
});

export const getBalanceForUser = async (userId: string): Promise<BrandBalance> => {
  const db = getFirebaseDb();
  if (!db) {
    return {
      customerName: 'Kullanıcı',
      balance: 0,
      currency: 'Marka',
      lastTopUp: '',
      transactions: [],
    };
  }

  const balanceRef = doc(db, 'balances', userId);
  const balanceSnapshot = await getDoc(balanceRef);
  const profile = await getUserProfileByUid(userId);

  const baseBalance = Number(balanceSnapshot.data()?.balance ?? 0);
  const txQuery = query(collection(db, 'transactions'), where('userId', '==', userId));
  const txSnapshot = await getDocs(txQuery);
  const transactions = txSnapshot.docs
    .map((item) => toTransaction(item.data() as Record<string, unknown>, item.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    customerName: profile?.name ?? balanceSnapshot.data()?.customerName ?? 'Kullanıcı',
    balance: baseBalance,
    currency: String(balanceSnapshot.data()?.currency ?? 'Marka'),
    lastTopUp: String(balanceSnapshot.data()?.lastTopUp ?? ''),
    transactions,
  };
};

export const updateBalanceForUser = async ({
  userId,
  amount,
  type,
  description,
  actorId,
  actorRole,
}: {
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  actorId?: string;
  actorRole?: string;
}) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const normalizedAmount = normalizeAmount(amount);
  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new Error('Geçerli bir miktar girin.');
  }

  const profile = await getUserProfileByUid(userId);
  const transactionRef = doc(collection(db, 'transactions'));
  const now = new Date().toISOString();

  const result = await runTransaction(db, async (transaction) => {
    const balanceRef = doc(db, 'balances', userId);
    const balanceSnapshot = await transaction.get(balanceRef);
    const currentBalance = Number(balanceSnapshot.data()?.balance ?? 0);
    const nextBalance = type === 'credit' ? currentBalance + normalizedAmount : currentBalance - normalizedAmount;

    if (type === 'debit' && currentBalance < normalizedAmount) {
      throw new Error('Yetersiz marka bakiyesi.');
    }

    transaction.set(
      balanceRef,
      {
        userId,
        customerName: profile?.name ?? balanceSnapshot.data()?.customerName ?? 'Kullanıcı',
        balance: Math.max(0, nextBalance),
        currency: 'Marka',
        lastTopUp: type === 'credit' ? now : balanceSnapshot.data()?.lastTopUp ?? '',
        updatedAt: now,
      },
      { merge: true },
    );

    transaction.set(transactionRef, {
      id: transactionRef.id,
      userId,
      type,
      amount: normalizedAmount,
      description,
      createdAt: now,
      date: now.slice(0, 10),
      actorId: actorId ?? '',
      actorRole: actorRole ?? '',
      balanceAfter: Math.max(0, nextBalance),
    });

    return {
      balance: Math.max(0, nextBalance),
      description,
    };
  });

  if (type === 'credit') {
    await createNotificationRecord({
      userId,
      title: 'Marka Yüklendi',
      message: `${normalizedAmount} marka bakiyenize eklendi.`,
      type: 'system',
    });
  }

  return result;
};

export const topUpCustomerBalance = async ({
  customerId,
  amount,
  description,
  actorId,
  actorRole,
}: {
  customerId: string;
  amount: number;
  description: string;
  actorId?: string;
  actorRole?: string;
}) => updateBalanceForUser({ userId: customerId, amount, type: 'credit', description, actorId, actorRole });

export const deductBalanceForOrder = async ({
  userId,
  amount,
  description,
  actorId,
  actorRole,
}: {
  userId: string;
  amount: number;
  description: string;
  actorId?: string;
  actorRole?: string;
}) => updateBalanceForUser({ userId, amount, type: 'debit', description, actorId, actorRole });
