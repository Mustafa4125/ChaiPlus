import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where, type DocumentData } from 'firebase/firestore';
import { getFirebaseDb } from '@/services/firebase/firebase';
import type { ProductReview } from '@/types';

// One review per customer per product, enforced by using a deterministic document id.
const reviewDocId = (productId: string, userId: string) => `${productId}_${userId}`;

const toReview = (id: string, data: DocumentData): ProductReview => ({
  id,
  productId: String(data.productId ?? ''),
  userId: String(data.userId ?? ''),
  customerName: String(data.customerName ?? 'Müşteri'),
  rating: Number(data.rating ?? 0),
  comment: String(data.comment ?? ''),
  createdAt: String(data.createdAt ?? new Date().toISOString()),
  updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : undefined,
});

export const getProductReviews = async (productId: string): Promise<ProductReview[]> => {
  const db = getFirebaseDb();
  if (!db) return [];

  // Sorted client-side to avoid requiring a composite index for a single equality filter.
  const q = query(collection(db, 'productReviews'), where('productId', '==', productId));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((item) => toReview(item.id, item.data()))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getUserReviewForProduct = async (productId: string, userId: string): Promise<ProductReview | null> => {
  const db = getFirebaseDb();
  if (!db) return null;

  const snapshot = await getDoc(doc(db, 'productReviews', reviewDocId(productId, userId)));
  return snapshot.exists() ? toReview(snapshot.id, snapshot.data()) : null;
};

export const submitProductReview = async ({
  productId,
  userId,
  customerName,
  rating,
  comment,
}: {
  productId: string;
  userId: string;
  customerName: string;
  rating: number;
  comment: string;
}) => {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase Firestore henüz yapılandırılmadı.');
  }

  const clampedRating = Math.min(5, Math.max(1, Math.round(rating)));
  const now = new Date().toISOString();
  const reviewRef = doc(db, 'productReviews', reviewDocId(productId, userId));
  const existing = await getDoc(reviewRef);

  await setDoc(reviewRef, {
    productId,
    userId,
    customerName,
    rating: clampedRating,
    comment: comment.trim(),
    createdAt: existing.exists() ? String(existing.data()?.createdAt ?? now) : now,
    updatedAt: now,
  });

  const reviews = await getProductReviews(productId);
  const ratingCount = reviews.length;
  const averageRating = ratingCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / ratingCount : 0;
  const roundedRating = Math.round(averageRating * 10) / 10;

  await updateDoc(doc(db, 'products', productId), {
    rating: roundedRating,
    ratingCount,
  });

  return { rating: roundedRating, ratingCount };
};
