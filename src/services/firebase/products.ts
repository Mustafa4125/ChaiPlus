import { addDoc, collection, deleteDoc, doc, getDocs, setDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';
import type { Product } from '@/types';

const productFromDoc = (id: string, data: DocumentData): Product => ({
  id,
  name: String(data.name ?? 'Ürün'),
  description: String(data.description ?? ''),
  price: Number(data.price ?? 0),
  image: String(data.image ?? ''),
  category: String(data.category ?? 'Genel'),
  isPopular: Boolean(data.isPopular),
  rating: Number(data.rating ?? 0),
  ratingCount: Number(data.ratingCount ?? 0),
  prepTime: String(data.prepTime ?? '10 dk'),
  calories: data.calories == null ? undefined : Number(data.calories),
  tags: Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [],
  isActive: data.isActive !== false,
});

export const getProductsFromFirestore = async (): Promise<Product[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  const snapshot = await getDocs(collection(db, 'products'));
  return snapshot.docs.map((item) => productFromDoc(item.id, item.data()));
};

export const createProductInFirestore = async (input: Partial<Product>) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const productData = {
    name: String(input.name ?? '').trim() || 'Yeni Ürün',
    description: String(input.description ?? '').trim(),
    price: Number(input.price ?? 0),
    image: String(input.image ?? '').trim() || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&h=800&fit=crop',
    category: String(input.category ?? 'Genel').trim() || 'Genel',
    isPopular: Boolean(input.isPopular),
    rating: 0,
    ratingCount: 0,
    prepTime: String(input.prepTime ?? '10 dk'),
    calories: input.calories == null ? null : Number(input.calories),
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => String(tag)) : [],
    isActive: input.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const ref = await addDoc(collection(db, 'products'), productData);
  return { id: ref.id, ...productData } as Product;
};

export const updateProductInFirestore = async (id: string, updates: Partial<Product>) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const payload = {
    ...(updates.name !== undefined ? { name: String(updates.name).trim() || 'Ürün' } : {}),
    ...(updates.description !== undefined ? { description: String(updates.description).trim() } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price ?? 0) } : {}),
    ...(updates.image !== undefined ? { image: String(updates.image).trim() } : {}),
    ...(updates.category !== undefined ? { category: String(updates.category).trim() || 'Genel' } : {}),
    ...(updates.isPopular !== undefined ? { isPopular: Boolean(updates.isPopular) } : {}),
    ...(updates.rating !== undefined ? { rating: Number(updates.rating ?? 4.5) } : {}),
    ...(updates.prepTime !== undefined ? { prepTime: String(updates.prepTime) } : {}),
    ...(updates.calories !== undefined ? { calories: updates.calories == null ? null : Number(updates.calories) } : {}),
    ...(updates.tags !== undefined ? { tags: Array.isArray(updates.tags) ? updates.tags.map((tag) => String(tag)) : [] } : {}),
    ...(updates.isActive !== undefined ? { isActive: Boolean(updates.isActive) } : {}),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, 'products', id), payload, { merge: true });
  return { id, ...payload } as Product;
};

export const deleteProductFromFirestore = async (id: string) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  await deleteDoc(doc(db, 'products', id));
};

export const toggleProductActiveStatus = async (id: string, isActive: boolean) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  await updateDoc(doc(db, 'products', id), {
    isActive,
    updatedAt: new Date().toISOString(),
  });
};
