// ai tests - useRegisterMutation hook

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ua: Створюємо моки до виконання vi.mock
const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  setAuth: vi.fn(),
  push: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  getApiErrorMessage: vi.fn(),
}));

// ua: Моки зовнішніх залежностей
vi.mock('@/services/auth.service', () => ({
  authService: {
    register: mocks.register,
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

import { useRegisterMutation } from './useRegisterMutation';

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

// ua: Дані для тестування реєстрації
const registerData = {
  name: 'John Doe',
  email: 'john@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
};

const user = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
};

describe('useRegisterMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // 1. Успішна реєстрація
  test('1.1 Повинен викликати authService.register з переданими даними', async () => {
    mocks.register.mockResolvedValue({
      user,
      message: 'Successfully registered!',
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.register).toHaveBeenCalledWith(registerData);
    });
  });

  test('1.2 Повинен записувати нового користувача в auth store', async () => {
    mocks.register.mockResolvedValue({
      user,
      message: 'Successfully registered!',
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.setAuth).toHaveBeenCalledWith(user);
    });
  });

  test('1.3 Повинен показувати повідомлення про успішну реєстрацію', async () => {
    mocks.register.mockResolvedValue({
      user,
      message: 'Account created!',
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith('Account created!');
    });
  });

  test('1.4 Повинен використовувати стандартне повідомлення, якщо API не повернув message', async () => {
    mocks.register.mockResolvedValue({
      user,
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        'Successfully registered!',
      );
    });
  });

  test('1.5 Повинен перенаправляти користувача на /workspaces', async () => {
    mocks.register.mockResolvedValue({
      user,
      message: 'Account created!',
    });

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith('/workspaces');
    });
  });

  // 2. Обробка помилок
  test('2.1 Повинен отримувати повідомлення через getApiErrorMessage', async () => {
    const error = new Error('Registration failed');

    mocks.register.mockRejectedValue(error);
    mocks.getApiErrorMessage.mockReturnValue('Email already exists');

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.getApiErrorMessage).toHaveBeenCalledWith(error);
    });
  });

  test('2.2 Повинен показувати повідомлення про помилку через toast', async () => {
    mocks.register.mockRejectedValue(new Error('Registration failed'));
    mocks.getApiErrorMessage.mockReturnValue('Email already exists');

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith('Email already exists');
    });
  });

  test('2.3 Не повинен перенаправляти користувача при помилці', async () => {
    mocks.register.mockRejectedValue(new Error('Registration failed'));
    mocks.getApiErrorMessage.mockReturnValue('Email already exists');

    const { result } = renderHook(() => useRegisterMutation(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(registerData);
    });

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalled();
    });

    expect(mocks.push).not.toHaveBeenCalled();
    expect(mocks.setAuth).not.toHaveBeenCalled();
  });
});
