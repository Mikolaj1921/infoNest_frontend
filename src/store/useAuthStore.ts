// ua: auth state architecture
// стор для управління станом

import { create } from 'zustand';
import { User } from '@/types/user';

// ua: інтерфейс для типізації стану авторизації

interface AuthState {
  user: User | null; // data user
  isAuthenticated: boolean; // ua: чи користувач авторизований
  isLoading: boolean; // ua: чи відбувається процес авторизації
  setAuth: (user: User | null) => void; // ua: set користувача та статус авторизації
  clearAuth: () => void; // ua: очистити дані авторизації
  setLoading: (loading: boolean) => void; // ua: set статус завантаження
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // ua: true, поки перевіряється куки при першому старті

  // сетери (action - функція для оновлення стану)

  // ua: сетер користувача та статусу авторизації
  setAuth: (user) =>
    set({
      user,
      isAuthenticated: true,
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
}));
