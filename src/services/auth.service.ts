import api from '@/lib/axios';
// types - model user data
import { User } from '@/types/user';
// types - model відповіді від API при авторизації
import { AuthResponse, MessageResponse } from '@/types/auth';

// ua: сервіс для роботи з API авторизації
export const authService = {
  // ua: Перевірка активної сесії через куки
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  // ua: login - Логін користувача
  login: async (dto: Record<string, string>): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', dto);
    return data;
  },

  // ua: register - реєстрація користувача

  register: async (dto: Record<string, string>): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', dto);
    return data;
  },

  // ua: logout - вихід користувача
  // meesage response - просто повідомлення про успішний вихід (без даних юзера)
  logout: async (): Promise<MessageResponse> => {
    const { data } = await api.post<MessageResponse>('/auth/logout');

    return data;
  },
};
