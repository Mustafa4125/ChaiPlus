import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, type Firestore, type DocumentData, type PartialWithFieldValue } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';

export interface FirestoreCollectionName {
  products: 'products';
  orders: 'orders';
  customers: 'customers';
  notifications: 'notifications';
  balances: 'balances';
  transactions: 'transactions';
  users: 'users';
}

export const COLLECTIONS: FirestoreCollectionName = {
  products: 'products',
  orders: 'orders',
  customers: 'customers',
  notifications: 'notifications',
  balances: 'balances',
  transactions: 'transactions',
  users: 'users',
};

const getDb = (): Firestore | null => getFirebaseDb();

export const getCollectionRef = (collectionName: keyof FirestoreCollectionName) => {
  const db = getDb();
  if (!db) return null;

  return collection(db, collectionName);
};

export const getDocumentRef = (collectionName: keyof FirestoreCollectionName, id: string) => {
  const db = getDb();
  if (!db) return null;

  return doc(db, collectionName, id);
};

export const readDocument = async <T>(collectionName: keyof FirestoreCollectionName, id: string) => {
  const ref = getDocumentRef(collectionName, id);
  if (!ref) return null;

  const snapshot = await getDoc(ref);
  return snapshot.exists() ? ({ id: snapshot.id, ...(snapshot.data() as T) }) : null;
};

export const readCollection = async <T>(collectionName: keyof FirestoreCollectionName) => {
  const ref = getCollectionRef(collectionName);
  if (!ref) return [] as T[];

  const snapshot = await getDocs(ref);
  return snapshot.docs.map((docSnapshot) => ({ id: docSnapshot.id, ...(docSnapshot.data() as T) }));
};

export const writeDocument = async <T extends DocumentData>(collectionName: keyof FirestoreCollectionName, id: string, data: T) => {
  const ref = getDocumentRef(collectionName, id);
  if (!ref) return null;

  await setDoc(ref, data as PartialWithFieldValue<DocumentData>, { merge: true });
  return { id, ...(data as object) };
};

export const updateDocument = async <T extends DocumentData>(collectionName: keyof FirestoreCollectionName, id: string, data: Partial<T>) => {
  const ref = getDocumentRef(collectionName, id);
  if (!ref) return null;

  await updateDoc(ref, data as Record<string, unknown>);
  return { id, ...(data as object) };
};

export const deleteDocument = async (collectionName: keyof FirestoreCollectionName, id: string) => {
  const ref = getDocumentRef(collectionName, id);
  if (!ref) return false;

  await deleteDoc(ref);
  return true;
};
