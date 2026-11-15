import api from '@/lib/axios';
// types - model user data
import { User } from '@/types/user';
// types - model відповіді від API при авторизації
import { AuthResponse, MessageResponse } from '@/types/auth';

// ua: типізація стандартної API-відповіді бекенду
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

// ua: сервіс для роботи з API авторизації
export const authService = {
  // ua: Перевірка активної сесії через куки
  // fix: поправлено типізацію відповіді від API
  getMe: async (): Promise<User> => {
    const { data: response } =
      await api.get<ApiResponse<{ user: User }>>('/auth/me');

    return response.data.user;
  },

  // ua: login - Логін користувача
  login: async (dto: Record<string, string>): Promise<AuthResponse> => {
    const { data: response } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      dto,
    );

    return response.data;
  },

  // ua: register - реєстрація користувача
  register: async (dto: Record<string, string>): Promise<AuthResponse> => {
    const { data: response } = await api.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      dto,
    );

    return response.data;
  },

  // ua: logout - вихід користувача
  logout: async (): Promise<MessageResponse> => {
    const { data: response } =
      await api.post<ApiResponse<MessageResponse>>('/auth/logout');

    return response.data;
  },
};
