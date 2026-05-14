import { describe, test, expect, expectTypeOf } from 'vitest';
// Import zustand store and types
import { useAuthStore } from '@/store/useAuthStore';
import { User } from '@/types/user';

// ua: mock дані користувача для тестування
const mockUser: User = {
  id: 'cuid-12345',
  name: 'Mikołaj Test',
  email: 'mikolaj@nest.pl',
  createdAt: '2026-05-14T20:00:00.000Z',
  updatedAt: '2026-05-14T20:00:00.000Z',
};

// ua: тестування zustand store для авторизації
describe('Zustand Auth Store (Global Test Folder)', () => {
  // ua: тестування початкового стану
  test('The initial state should be correct', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  // ua: тестування методу setAuth
  test('The setAuth method should correctly set the user', () => {
    useAuthStore.getState().setAuth(mockUser);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  // ua: тестування методу clearAuth
  test('The clearAuth method should fully clear the state', () => {
    useAuthStore.setState({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });

  // ua: тестування types - validation of types
  test('The types should be correctly validated - password and refreshToken', () => {
    //  ua: check що тип користувача в сторі точно відповідає нашому інтерфейсу User
    const state = useAuthStore.getState();
    expectTypeOf(state.user).toMatchTypeOf<User | null>();

    // ua: перевірка на відсутність чутливих полів з Prisma-схеми бекенду
    expectTypeOf<User>().not.toHaveProperty('password');
    expectTypeOf<User>().not.toHaveProperty('refreshToken');

    // ua: перевірка наявності лише обовязкових публічних полів
    expectTypeOf<User>().toHaveProperty('id');
    expectTypeOf<User>().toHaveProperty('email');
    expectTypeOf<User>().toHaveProperty('name');
  });
});
