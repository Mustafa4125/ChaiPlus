import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/services/firebase/firebase';

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export const mapFirebaseUser = (user: FirebaseUser | null): AuthUserProfile | null => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
};

export const signInWithEmail = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Authentication is not configured');

  const credential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(credential.user);
};

export const signUpWithEmail = async (email: string, password: string) => {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error('Firebase Authentication is not configured');

  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(credential.user);
};

export const signOutUser = async () => {
  const auth = getFirebaseAuth();
  if (!auth) return;

  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: AuthUserProfile | null) => void) => {
  const auth = getFirebaseAuth();
  if (!auth) {
    callback(null);
    return () => undefined;
  }

  return onAuthStateChanged(auth, (user) => callback(mapFirebaseUser(user)));
};
