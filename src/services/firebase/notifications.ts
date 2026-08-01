import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, updateDoc, where, type DocumentData } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirebaseApp, getFirebaseDb } from '@/services/firebase/firebase';
import type { Notification } from '@/types';

export type AppNotificationType = 'order' | 'system' | 'promo';

const normalizeNotification = (id: string, data: DocumentData): Notification => ({
  id,
  title: String(data.title ?? 'Bildirim'),
  message: String(data.message ?? ''),
  type: data.type === 'promo' ? 'promo' : data.type === 'system' ? 'system' : 'order',
  read: Boolean(data.read),
  createdAt: String(data.createdAt ?? new Date().toISOString()),
});

export const createNotificationRecord = async ({
  userId,
  title,
  message,
  type = 'order',
}: {
  userId: string;
  title: string;
  message: string;
  type?: AppNotificationType;
}) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const createdAt = new Date().toISOString();
  const payload = {
    userId,
    title: title.trim() || 'Bildirim',
    message: message.trim() || 'Yeni bildirim',
    type,
    read: false,
    createdAt,
  };

  const ref = await addDoc(collection(db, 'notifications'), payload);
  return normalizeNotification(ref.id, payload);
};

export const getNotificationsFromFirestore = async (userId: string): Promise<Notification[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnapshot) => normalizeNotification(docSnapshot.id, docSnapshot.data()));
};

export const subscribeToNotifications = (userId: string, callback: (notifications: Notification[]) => void) => {
  const db = getFirebaseDb();
  if (!db) {
    callback([]);
    return () => undefined;
  }

  const q = query(collection(db, 'notifications'), where('userId', '==', userId), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((docSnapshot) => normalizeNotification(docSnapshot.id, docSnapshot.data())));
  }, () => {
    callback([]);
  });
};

export const markAllNotificationsAsReadForUser = async (userId: string) => {
  const db = getFirebaseDb();
  if (!db) return;

  const q = query(collection(db, 'notifications'), where('userId', '==', userId), where('read', '==', false));
  const snapshot = await getDocs(q);

  await Promise.all(snapshot.docs.map((docSnapshot) => updateDoc(doc(db, 'notifications', docSnapshot.id), {
    read: true,
    updatedAt: new Date().toISOString(),
  })));
};

export const registerForegroundMessaging = () => {
  const app = getFirebaseApp();
  if (!app || typeof window === 'undefined') return () => undefined;

  const messaging = getMessaging(app);
  return onMessage(messaging, (payload) => {
    if (!payload.notification) return;

    const title = payload.notification.title ?? 'ChaiPlus';
    const body = payload.notification.body ?? '';

    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg',
      });
    }
  });
};

export const requestFirebaseMessagingPermission = async (userId?: string): Promise<string | null> => {
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
    return null;
  }

  if (Notification.permission === 'denied') {
    return null;
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return null;
  }

  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY ?? '';
  if (!vapidKey) {
    return null;
  }

  const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
  const messaging = getMessaging(app);
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration ?? undefined,
  });

  if (!token || !userId) {
    return token;
  }

  const db = getFirebaseDb();
  if (db) {
    await addDoc(collection(db, 'userTokens'), {
      userId,
      token,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  return token;
};
