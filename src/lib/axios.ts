import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
// auth store - для можливості виклику clearAuth при 401 - без реакт хуків
import { useAuthStore } from '@/store/useAuthStore';

// ua: Типізуємо чергу: resolve тепер приймає результат повторного запиту api()
interface FailedRequest {
  resolve: (value: unknown) => void; // ua: resolve тепер приймає результат повторного запиту api()
  reject: (err: AxiosError) => void;
}

const api = axios.create({
  // ua: додаємо захист на випадок, якщо змінна чомусь пуста
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // musthave for cookies to be sent in cross-origin requests
});

// ua: флаг щоб не було безкінечного циклу рефреш запитів
let isRefreshing = false;
let failedRequestsQueue: FailedRequest[] = [];

// ua: коли процес рефрешу завершено, ми запускаємо або скасовуємо всі заморожені запити
const processQueue = (error: AxiosError | null) => {
  failedRequestsQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      // ua: викликаємо без аргументів, бо стрілочна функція сама знає свій originalRequest
      prom.resolve(null);
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

      // ua: якщо вже йде процес рефрешу, заморожуємо запит і чекаємо
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            // ФІКС: resolve повертає новий виклик api(), щоб компонент отримав дані, а не undefined
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
        processQueue(null); // Виконуємо чергу
        return api(originalRequest); // Виконуємо поточний запит
      } catch (refreshError) {
        isRefreshing = false;
        const axiosRefreshError = refreshError as AxiosError;
        processQueue(axiosRefreshError); // Відхиляємо всю чергу
        clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // this will catch all errors from API calls and log them
    const data = error.response?.data as { message?: string } | undefined;
    const message = data?.message || 'Something went wrong';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

export default api;
