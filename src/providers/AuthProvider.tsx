// ua: Логіка перевірки сесії при завантаженні

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import axios from 'axios'; // ua: для перевірки типу помилки в catch

import {
  useAuthActions,
  useIsAuthLoading,
  useIsAuthenticated,
} from '@/store/useAuthStore';
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
  const router = useRouter();
  const pathname = usePathname(); // ua: поточний шлях

  // useAuthActions - хук для отримання екшенів авторизації
  const { setAuth, clearAuth } = useAuthActions();
  // useIsAuthLoading - хук для отримання статусу завантаження авторизації
  const isLoading = useIsAuthLoading();
  // useIsAuthenticated - хук для отримання статусу авторизації
  const isAuthenticated = useIsAuthenticated();

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

  // ua: check чи авторизований юзер + перенаправка на /workspaces | /login
  useEffect(() => {
    if (!isLoading) return;

    // ua: список публічних сторінок авторизації
    const isAuthPage = pathname === '/login' || pathname === '/register';
    const isPrivatePage =
      pathname.startsWith('/workspaces') || pathname.startsWith('/profile');

    // ua: якщо юзер авторизований і пробує зайти на /login або /register
    if (isAuthenticated && isAuthPage) {
      router.replace('/workspaces'); // ua: перенаправка в воркспейси
      return;
    }

    // ua: якщо юзер не авторизований і пробує зайти на приватну сторінку
    if (!isAuthenticated && isPrivatePage) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // ua: Блокуємо інтерфейс лоадером, поки триває перевірка куків
  if (isLoading) {
    return <FullPageLoader />;
  }

  return <>{children}</>;
}
