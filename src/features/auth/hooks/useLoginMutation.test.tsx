// ai tests - useLoginMutation hook

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ua: Створюємо моки до виконання vi.mock
const mocks = vi.hoisted(() => ({
  login: vi.fn(),
  setAuth: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  getApiErrorMessage: vi.fn(),
}));

// ua: Моки зовнішніх залежностей
vi.mock('@/services/auth.service', () => ({
  authService: {
    login: mocks.login,
  },
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthActions: () => ({
    setAuth: mocks.setAuth,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

vi.mock('@/utils/api-error', () => ({
  getApiErrorMessage: mocks.getApiErrorMessage,
}));

import { useLoginMutation } from './useLoginMutation';

// ua: Тестовий QueryClient для React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: React.PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return Wrapper;
};

// ua: Дані для тестування авторизації
const loginData = {
  email: 'john@example.com',
  password: 'Password123!',
};

const user = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

describe('useLoginMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // 1. Успішна авторизація
  test('1.1 Повинен викликати authService.login з переданими даними', async () => {
    mocks.login.mockResolvedValue({
      user,
      message: 'Successfully logged in!',
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.login).toHaveBeenCalledWith(loginData);
    });
  });

  test('1.2 Повинен записувати користувача в auth store', async () => {
    mocks.login.mockResolvedValue({
      user,
      message: 'Successfully logged in!',
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.setAuth).toHaveBeenCalledWith(user);
    });
  });

  test('1.3 Повинен показувати повідомлення про успішну авторизацію', async () => {
    mocks.login.mockResolvedValue({
      user,
      message: 'Welcome back!',
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith('Welcome back!');
    });
  });

  test('1.4 Повинен використовувати стандартне повідомлення, якщо API не повернув message', async () => {
    mocks.login.mockResolvedValue({
      user,
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        'Successfully logged in!',
      );
    });
  });

  test('1.5 Повинен перенаправляти користувача на /workspaces', async () => {
    mocks.login.mockResolvedValue({
      user,
      message: 'Welcome back!',
    });

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith('/workspaces');
    });
  });

  // 2. Обробка помилок
  test('2.1 Повинен отримувати повідомлення через getApiErrorMessage', async () => {
    const error = new Error('Login failed');

    mocks.login.mockRejectedValue(error);
    mocks.getApiErrorMessage.mockReturnValue('Invalid credentials');

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.getApiErrorMessage).toHaveBeenCalledWith(error);
    });
  });

  test('2.2 Повинен показувати повідомлення про помилку через toast', async () => {
    mocks.login.mockRejectedValue(new Error('Login failed'));
    mocks.getApiErrorMessage.mockReturnValue('Invalid credentials');

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  test('2.3 Не повинен перенаправляти користувача при помилці', async () => {
    mocks.login.mockRejectedValue(new Error('Login failed'));
    mocks.getApiErrorMessage.mockReturnValue('Invalid credentials');

    const { result } = renderHook(() => useLoginMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(loginData);
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalled();
    });

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.setAuth).not.toHaveBeenCalled();
  });
});
