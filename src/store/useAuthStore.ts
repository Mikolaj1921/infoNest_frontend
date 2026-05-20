// ua: auth state architecture
// стор для управління станом

import { create } from 'zustand';
import { User } from '@/types/user';

// ua: інтерфейс для типізації стану авторизації

interface AuthState {
  user: User | null; // data user
  isAuthenticated: boolean; // ua: чи користувач авторизований
  isLoading: boolean; // ua: чи відбувається процес авторизації

  // для масштабування - Групування функцій в об'єкт actions
  actions: {
    setAuth: (user: User | null) => void; // ua: set користувача та статус авторизації
    clearAuth: () => void; // ua: очистити дані авторизації
    setLoading: (loading: boolean) => void; // ua: set статус завантаження
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  // початковий стан
  user: null,
  isAuthenticated: false,
  isLoading: true, // ua: true, поки перевіряється куки при першому старті

  // (action - функція для оновлення стану)

  actions: {
    // ua: сетер користувача та статусу авторизації
    setAuth: (user) =>
      set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),

    // ua: сетер очиститки даних авторизації
    clearAuth: () =>
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),

    // ua: сетер статусу завантаження
    setLoading: (loading) =>
      set({
        isLoading: loading,
      }),
  },
}));

// Get data from the store
// ua: хук для отримання даних авторизації - user, isAuthenticated, isLoading
// витягування конкретних даних з стору
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useIsAuthLoading = () => useAuthStore((state) => state.isLoading);

// Update data in the store
// ua: хук для отримання екшенів авторизації - setAuth, clearAuth, setLoading
// для заміни даних в сторі - тут юзається сетери з actions
export const useAuthActions = () => useAuthStore((state) => state.actions);
