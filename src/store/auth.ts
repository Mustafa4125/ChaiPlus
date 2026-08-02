import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from '@/types';
import { getFirebaseAuth } from '@/services/firebase/firebase';
import { authenticateWithUsernameAndPassword, getUserProfileByUid, mapFirebaseProfileToAppUser } from '@/services/firebase/users';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: async (username, password) => {
        set({ loading: true });
        try {
          const user = await authenticateWithUsernameAndPassword(username, password);
          set({ user, isAuthenticated: true, loading: false });
          return user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      logout: async () => {
        const auth = getFirebaseAuth();
        if (auth) {
          await signOut(auth);
        }
        set({ user: null, isAuthenticated: false, loading: false });
      },
      hydrate: () => {
        const auth = getFirebaseAuth();
        if (!auth) {
          set({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
          }

          const profile = await getUserProfileByUid(firebaseUser.uid);
          if (!profile) {
            set({ user: null, isAuthenticated: false, loading: false });
            return;
          }

          set({ user: mapFirebaseProfileToAppUser(profile), isAuthenticated: true, loading: false });
        });
      },
    }),
    { name: 'chaiplus-auth' },
  ),
);

