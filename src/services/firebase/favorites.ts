import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, type DocumentData } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';
import type { FavoriteOrder, OrderItem } from '@/types';

const favoriteOrderFromDoc = (id: string, data: DocumentData): FavoriteOrder => ({
  id,
  userId: typeof data.userId === 'string' ? data.userId : undefined,
  name: String(data.name ?? 'Favori Sipariş'),
  items: Array.isArray(data.items)
    ? data.items.map((item: DocumentData) => ({
        productId: String(item.productId ?? ''),
        name: String(item.name ?? ''),
        quantity: Number(item.quantity ?? 0),
        price: Number(item.price ?? 0),
        size: String(item.size ?? 'Orta'),
        extras: Array.isArray(item.extras) ? item.extras.map((extra: unknown) => String(extra)) : [],
      }))
    : [],
  total: Number(data.total ?? 0),
  orderCount: Number(data.orderCount ?? 1),
  createdAt: typeof data.createdAt === 'string' ? data.createdAt : undefined,
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
});

export const getFavoriteOrdersFromFirestore = async (userId: string): Promise<FavoriteOrder[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, 'favoriteOrders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => favoriteOrderFromDoc(docSnapshot.id, docSnapshot.data()));
};

export const subscribeToFavoriteOrders = (userId: string, callback: (favorites: FavoriteOrder[]) => void) => {
  const db = getFirebaseDb();
  if (!db) {
    callback([]);
    return () => undefined;
  }

  const q = query(collection(db, 'favoriteOrders'), where('userId', '==', userId), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => favoriteOrderFromDoc(docSnapshot.id, docSnapshot.data())));
  }, () => {
    callback([]);
  });
};

export const createFavoriteOrderInFirestore = async ({
  userId,
  name,
  items,
  total,
}: {
  userId: string;
  name: string;
  items: OrderItem[];
  total: number;
}) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const createdAt = new Date().toISOString();
  const payload = {
    userId,
    name: name.trim() || 'Favori Sipariş',
    items,
    total,
    orderCount: 1,
    createdAt,
    updatedAt: createdAt,
  };

  const ref = await addDoc(collection(db, 'favoriteOrders'), payload);
  return favoriteOrderFromDoc(ref.id, payload);
};

export const updateFavoriteOrderNameInFirestore = async (favoriteId: string, name: string) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  await updateDoc(doc(db, 'favoriteOrders', favoriteId), {
    name: name.trim() || 'Favori Sipariş',
    updatedAt: new Date().toISOString(),
  });
};

export const deleteFavoriteOrderFromFirestore = async (favoriteId: string) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  await deleteDoc(doc(db, 'favoriteOrders', favoriteId));
};
