import axios from 'axios';
// auth store - для можливості виклику clearAuth при 401
import { useAuthStore } from '@/store/useAuthStore';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // musthave for cookies to be sent in cross-origin requests
});

// ua: флаг щоб не було безкінечного циклу рефреш запитів
let isRefreshing = false;

// add a request interceptor to include the token in headers
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/me') {
        return Promise.reject(error);
      }

      // ua: якщо вже йде процес рефрешу, то не запускаємо його знову,
      // а просто відхиляємо проміс
      if (isRefreshing) {
        return Promise.reject(error);
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
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }

    // ua: якщо 401, то просто відхиляємо проміс, щоб це можна було обробити в компонентах
    //  (наприклад, для редіректу на логін)
    if (error.response?.status === 401) {
      return Promise.reject(error);
    }
    // this will catch all errors from API calls and log them
    const message = error.response?.data?.message || 'Щось пішло не так';
    console.error('API Error:', message);
    return Promise.reject(error);
  },
);

export default api;
