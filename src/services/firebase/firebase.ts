import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  type Auth,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAnalytics, type Analytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

const defaultConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? '',
};

export const firebaseConfig = defaultConfig;

export const isFirebaseConfigured = () => Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId,
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let storage: FirebaseStorage | null = null;

export const initializeFirebase = async () => {
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, db: null, analytics: null, storage: null, configured: false };
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }

  auth = getAuth(app);
  // Oturumu tarayıcıda kalıcı tut
  await setPersistence(auth, browserLocalPersistence);

  
  db = getFirestore(app);
  storage = getStorage(app);

  const analyticsSupported = await isAnalyticsSupported();
  if (analyticsSupported) {
    analytics = getAnalytics(app);
  }

  return { app, auth, db, analytics, storage, configured: true };
};

export const getFirebaseApp = () => app ?? null;
export const getFirebaseAuth = () => auth ?? null;
export const getFirebaseDb = () => db ?? null;
export const getFirebaseStorage = () => storage ?? null;
export const getFirebaseAnalytics = () => analytics ?? null;
