import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
// auth store - для можливості виклику clearAuth при 401 - без реакт хуків
import { useAuthStore } from '@/store/useAuthStore';

interface FailedRequest {
  resolve: (token: string | null) => void;
  reject: (err: AxiosError) => void;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // musthave for cookies to be sent in cross-origin requests
});

// ua: флаг щоб не було безкінечного циклу рефреш запитів
let isRefreshing = false;
let failedRequestsQueue: FailedRequest[] = [];

// -- fix
// ua: поправляє проблему з одночасними 401 помилками
// (Тепер, якщо isRefreshing === true, запити №2 та №3 не відхиляються.
// Вони заморожуються всередині нового Promise і чекають у масиві.)

// ua: коли процес рефрешу завершено, ми проходимо по черзі
// failedRequestsQueue і виконуємо resolve або reject для кожного запиту
const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedRequestsQueue = [];
};

// add a request interceptor to include the token in headers
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ua: отримуємо clearAuth з стору - Без реакт хуків
    const { clearAuth } = useAuthStore.getState().actions;

    if (!originalRequest) return Promise.reject(error);

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/me') {
        clearAuth();
        return Promise.reject(error);
      }

      // ua: якщо вже йде процес рефрешу, то не запускаємо його знову,
      // а просто відхиляємо проміс (додано: ставимо в чергу очікування)
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            resolve: () => resolve(api(originalRequest)),
            reject: (err: AxiosError) => reject(err),
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        isRefreshing = false;
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        const axiosRefreshError = refreshError as AxiosError;
        processQueue(axiosRefreshError, null);
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // this will catch all errors from API calls and log them
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message || 'Щось пішло не так';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

export default api;
