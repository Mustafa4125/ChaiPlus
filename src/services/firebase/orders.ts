import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, updateDoc, where, type DocumentData } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';
import { deductBalanceForOrder } from '@/services/firebase/balance';
import { createNotificationRecord } from '@/services/firebase/notifications';
import type { Order, OrderStatus } from '@/types';

const normalizeOrderStatus = (status: string): OrderStatus => {
  if (status === 'preparing') return 'preparing';
  if (status === 'ready' || status === 'yolda') return 'yolda';
  if (status === 'delivered') return 'delivered';
  if (status === 'cancelled') return 'cancelled';
  return 'pending';
};

const toOrder = (id: string, data: DocumentData): Order => ({
  id,
  userId: typeof data.userId === 'string' ? data.userId : undefined,
  customerName: typeof data.customerName === 'string' ? data.customerName : undefined,
  items: Array.isArray(data.items) ? data.items.map((item: DocumentData) => ({
    productId: String(item.productId ?? ''),
    name: String(item.name ?? ''),
    quantity: Number(item.quantity ?? 0),
    price: Number(item.price ?? 0),
    size: String(item.size ?? ''),
    extras: Array.isArray(item.extras) ? item.extras.map((extra: unknown) => String(extra)) : [],
  })) : [],
  total: Number(data.total ?? 0),
  status: normalizeOrderStatus(String(data.status ?? 'pending')),
  createdAt: String(data.createdAt ?? new Date().toISOString()),
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
  estimatedTime: typeof data.estimatedTime === 'string' ? data.estimatedTime : undefined,
  balanceDeducted: Boolean(data.balanceDeducted),
});

export const createOrderInFirestore = async ({
  userId,
  customerName,
  items,
  total,
}: {
  userId: string;
  customerName: string;
  items: Order['items'];
  total: number;
}): Promise<Order> => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  await deductBalanceForOrder({
    userId,
    amount: total,
    description: 'Sipariş oluşturma - marka düşüşü',
    actorId: userId,
    actorRole: 'customer',
  });

  const createdAt = new Date().toISOString();
  const payload = {
    userId,
    customerName,
    items,
    total,
    status: 'pending',
    createdAt,
    updatedAt: createdAt,
    estimatedTime: '20 dk',
    balanceDeducted: true,
  };

  const ref = await addDoc(collection(db, 'orders'), payload);

  await createNotificationRecord({
    userId,
    title: 'Yeni Sipariş',
    message: 'Siparişiniz alındı ve hazırlanıyor.',
    type: 'order',
  });

  return toOrder(ref.id, payload);
};

export const getOrdersFromFirestore = async (userId?: string): Promise<Order[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = userId
    ? query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnapshot) => toOrder(docSnapshot.id, docSnapshot.data()));
};

export const updateOrderStatusInFirestore = async (orderId: string, status: OrderStatus, userId?: string) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const orderRef = doc(db, 'orders', orderId);
  const currentSnapshot = await getDoc(orderRef);
  const currentOrder = currentSnapshot.exists() ? (currentSnapshot.data() as DocumentData) : null;
  const payload: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
    estimatedTime: status === 'delivered' ? 'Teslim edildi' : status === 'yolda' ? '10 dk' : status === 'preparing' ? '15 dk' : '20 dk',
  };

  if (status === 'delivered' && userId && currentOrder && currentOrder.balanceDeducted !== true) {
    const total = Number(currentOrder.total ?? 0);
    await deductBalanceForOrder({
      userId,
      amount: total,
      description: 'Sipariş teslimi üzerinden marka düşüşü',
      actorId: userId,
      actorRole: 'customer',
    });
    payload.balanceDeducted = true;
  }

  await updateDoc(orderRef, payload);

  if (status === 'preparing') {
    const order = currentOrder ?? {};
    const targetUserId = typeof order.userId === 'string' ? order.userId : userId;
    if (targetUserId) {
      await createNotificationRecord({
        userId: targetUserId,
        title: 'Sipariş Hazırlanıyor',
        message: 'Siparişiniz mutfakta hazırlanıyor.',
        type: 'order',
      });
    }
  }

  if (status === 'yolda') {
    const order = currentOrder ?? {};
    const targetUserId = typeof order.userId === 'string' ? order.userId : userId;
    if (targetUserId) {
      await createNotificationRecord({
        userId: targetUserId,
        title: 'Sipariş Yolda',
        message: 'Siparişiniz teslimat ekibine teslim edildi.',
        type: 'order',
      });
    }
  }

  if (status === 'delivered') {
    const order = currentOrder ?? {};
    const targetUserId = typeof order.userId === 'string' ? order.userId : userId;
    if (targetUserId) {
      await createNotificationRecord({
        userId: targetUserId,
        title: 'Sipariş Teslim Edildi',
        message: 'Siparişiniz başarıyla teslim edildi.',
        type: 'order',
      });
    }
  }

  return payload;
};

export const subscribeToOrders = (
  userId: string | undefined,
  callback: (orders: Order[]) => void,
  onError?: (error: unknown) => void,
) => {
  const db = getFirebaseDb();
  if (!db) {
    callback([]);
    return () => undefined;
  }

  const q = userId
    ? query(collection(db, 'orders'), where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => toOrder(docSnapshot.id, docSnapshot.data())));
  }, (error) => {
    callback([]);
    onError?.(error);
  });
};
