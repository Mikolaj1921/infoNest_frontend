// ua: Логіка перевірки сесії при завантаженні

'use client';

import { useEffect } from 'react';
import axios from 'axios'; // ua: для перевірки типу помилки в catch
// ua: useAuthStore - zustand стор для управління станом авторизації - custom hook
import { useAuthStore } from '@/store/useAuthStore';
// ua: authService - сервіс для роботи з API авторизації
import { authService } from '@/services/auth.service';
// components
import { FullPageLoader } from '@/components/shared/FullPageLoader';

// ua: AuthProvider - global provider для авторизації, який перевіряє куки та
// оновлює стан авторизації в Zustand
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // ua: отримання сетерa та статус завантаження з Zustand
  const { setAuth, clearAuth, isLoading } = useAuthStore();

  // ua: при першому завантаженні перевіряємо куки та оновлюємо стан авторизації
  useEffect(() => {
    // ua: перевірка сесії
    const checkSession = async () => {
      try {
        const userData = await authService.getMe();
        setAuth(userData); // ua: Якщо сесія жива, пишемо юзера в Zustand
      } catch (error) {
        clearAuth();

        // ua: можна логувати в консоль тільки для локальної розробки
        // і тільки якщо це не 401  (наприклад, якщо бекенд взагалі ліг)
        if (process.env.NODE_ENV === 'development') {
          if (axios.isAxiosError(error)) {
            // ua: HTTP помилки
            if (error.response?.status !== 401) {
              console.error('Session initialization error:', error.message);
            }
          } else {
            // ua: Інші типи помилок (не повязані з HTTP)
            console.error('Unexpected initialization error:', error);
          }
        }
      }
    };

    checkSession();
  }, [setAuth, clearAuth]);

  // ua: Блокуємо інтерфейс лоадером, поки триває перевірка куків
  if (isLoading) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
