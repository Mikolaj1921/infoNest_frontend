import api from '@/lib/axios';
// types - model user data
import { User } from '@/types/user';

export const authService = {
  // ua: Перевірка активної сесії через куки
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};
