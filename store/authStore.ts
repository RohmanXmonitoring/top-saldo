import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/user.types';
import { auth } from '@/lib/firebase/client';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      initialized: false,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      logout: async () => {
        await signOut(auth);
        set({ user: null });
      },
      initAuth: () => {
        const { setUser, setLoading } = useAuthStore.getState();
        setLoading(true);
        
        onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            try {
              const response = await fetch(`/api/users/${firebaseUser.uid}`);
              const userData = await response.json();
              setUser(userData);
            } catch (error) {
              console.error('Error fetching user data:', error);
              setUser(null);
            }
          } else {
            setUser(null);
          }
          setLoading(false);
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
