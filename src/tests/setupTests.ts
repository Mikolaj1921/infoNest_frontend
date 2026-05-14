import { beforeEach } from 'vitest';
import { useAuthStore } from '@/store/useAuthStore';

beforeEach(() => {
  // ua: Перед кожним тестом примусово повертаємо стор до початкового стану
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
});
