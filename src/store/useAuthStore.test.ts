// ua: готові ai тести для useAuthStore
import { describe, test, expect } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { User } from '@/types/user';
import { expectTypeOf } from 'vitest';

const mockUser: User = {
  id: 'cuid-12345',
  name: 'Mikołaj Testowy',
  email: 'mikolaj@nest.pl',
  createdAt: '2026-05-14T20:00:00.000Z',
  updatedAt: '2026-05-14T20:00:00.000Z',
};

describe('Zustand Auth Store (Colocated Test)', () => {
  test('1. Початковий стан має бути за замовчуванням правильним', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  test('2. Метод setAuth має коректно записувати користувача', () => {
    // ua: виклик метод через об'єкт actions згідно з оновленням
    useAuthStore.getState().actions.setAuth(mockUser);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  test('3. Метод clearAuth має повністю очищувати стан', () => {
    // ua: штучно ініціалізуємо стан авторизованого користувача
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // ua: викликаємо логаут через об'єкт actions
    useAuthStore.getState().actions.clearAuth();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  test("4. Валідація типів: об'єкт User має бути безпечним і не містити паролів", () => {
    const state = useAuthStore.getState();
    expectTypeOf(state.user).toMatchTypeOf<User | null>();

    expectTypeOf<User>().not.toHaveProperty('password');
    expectTypeOf<User>().not.toHaveProperty('refreshToken');

    expectTypeOf<User>().toHaveProperty('id');
    expectTypeOf<User>().toHaveProperty('email');
    expectTypeOf<User>().toHaveProperty('name');
  });
});
