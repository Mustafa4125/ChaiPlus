import {
  firebaseConfig as clientFirebaseConfig,
  initializeFirebase as initializeFirebaseClient,
  isFirebaseConfigured as isFirebaseClientConfigured,
} from '@/services/firebase/firebase';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  ...clientFirebaseConfig,
  measurementId: clientFirebaseConfig.measurementId ?? '',
};

export const isFirebaseConfigured = () => isFirebaseClientConfigured();

export const initializeFirebase = async () => {
  const result = await initializeFirebaseClient();

  return {
    config: firebaseConfig,
    ready: result.configured,
    mode: result.configured ? ('firebase' as const) : ('mock' as const),
  };
};
