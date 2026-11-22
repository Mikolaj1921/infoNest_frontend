// ai tests - auth provider

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import axios, { AxiosError } from 'axios';

import AuthProvider from './AuthProvider';

// ua: моки залежностей провайдера
const {
  mockReplace,
  mockSetAuth,
  mockClearAuth,
  mockGetMe,
  mockIsAuthLoading,
  mockIsAuthenticated,
  mockPathname,
} = vi.hoisted(() => ({
  mockReplace: vi.fn(),
  mockSetAuth: vi.fn(),
  mockClearAuth: vi.fn(),
  mockGetMe: vi.fn(),
  mockIsAuthLoading: { value: true },
  mockIsAuthenticated: { value: false },
  mockPathname: { value: '/' },
}));

// ua: мок навігації Next.js
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  usePathname: () => mockPathname.value,
}));

// ua: мок Zustand auth store
vi.mock('@/store/useAuthStore', () => ({
  useAuthActions: () => ({
    setAuth: mockSetAuth,
    clearAuth: mockClearAuth,
  }),
  useIsAuthLoading: () => mockIsAuthLoading.value,
  useIsAuthenticated: () => mockIsAuthenticated.value,
}));

// ua: мок сервісу авторизації
vi.mock('@/services/auth.service', () => ({
  authService: {
    getMe: mockGetMe,
  },
}));

// ua: мок повноекранного loader
vi.mock('@/components/shared/FullPageLoader', () => ({
  FullPageLoader: () => <div data-testid="full-page-loader">Loading...</div>,
}));

describe('AuthProvider', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockIsAuthLoading.value = true;
    mockIsAuthenticated.value = false;
    mockPathname.value = '/';

    mockGetMe.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  // ua: 1. Перевірка відображення loader під час завантаження
  it('1. Повинен показувати FullPageLoader під час перевірки авторизації', () => {
    mockIsAuthLoading.value = true;

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    expect(screen.getByTestId('full-page-loader')).toBeTruthy();
    expect(screen.queryByText('Application content')).toBeNull();
  });

  // ua: 2. Перевірка відображення children після завершення завантаження
  it('2. Повинен відображати children після завершення перевірки авторизації', () => {
    mockIsAuthLoading.value = false;

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    expect(screen.getByText('Application content')).toBeTruthy();
    expect(screen.queryByTestId('full-page-loader')).toBeNull();
  });

  // ua: 3. Успішна перевірка сесії
  it('3. Повинен отримувати користувача та записувати його в auth store', async () => {
    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockGetMe).toHaveBeenCalledTimes(1);
      expect(mockSetAuth).toHaveBeenCalledWith(mockUser);
    });

    expect(mockClearAuth).not.toHaveBeenCalled();
  });

  // ua: 4. Очищення авторизації при помилці перевірки сесії
  it('4. Повинен очищувати авторизацію, якщо перевірка сесії завершилась помилкою', async () => {
    mockGetMe.mockRejectedValueOnce(new Error('Session error'));

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
    });

    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  // ua: 5. Відсутність логування 401 під час перевірки сесії
  it('5. Не повинен логувати помилку 401 у development режимі', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const unauthorizedError = Object.assign(new AxiosError('Unauthorized'), {
      response: {
        status: 401,
        data: {},
        statusText: 'Unauthorized',
        headers: {},
        config: {},
      },
    });

    mockGetMe.mockRejectedValueOnce(unauthorizedError);

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
    });

    expect(axios.isAxiosError(unauthorizedError)).toBe(true);
    expect(consoleError).not.toHaveBeenCalled();
  });

  // ua: 6. Логування HTTP помилок, відмінних від 401
  it('6. Повинен логувати HTTP помилки, відмінні від 401, у development режимі', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const serverError = Object.assign(new AxiosError('Internal Server Error'), {
      response: {
        status: 500,
        data: {},
        statusText: 'Internal Server Error',
        headers: {},
        config: {},
      },
    });

    mockGetMe.mockRejectedValueOnce(serverError);

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Session initialization error:',
      'Internal Server Error',
    );
  });

  // ua: 7. Логування неочікуваних помилок
  it('7. Повинен логувати не-Axios помилки у development режимі', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const unexpectedError = new Error('Unexpected error');

    mockGetMe.mockRejectedValueOnce(unexpectedError);

    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockClearAuth).toHaveBeenCalledTimes(1);
    });

    expect(consoleError).toHaveBeenCalledWith(
      'Unexpected initialization error:',
      unexpectedError,
    );
  });

  // ua: 8. Перенаправлення авторизованого користувача зі сторінки login
  it('8. Повинен перенаправляти авторизованого користувача з /login до /workspaces', async () => {
    mockIsAuthLoading.value = false;
    mockIsAuthenticated.value = true;
    mockPathname.value = '/login';

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/workspaces');
    });
  });

  // ua: 9. Перенаправлення авторизованого користувача зі сторінки register
  it('9. Повинен перенаправляти авторизованого користувача з /register до /workspaces', async () => {
    mockIsAuthLoading.value = false;
    mockIsAuthenticated.value = true;
    mockPathname.value = '/register';

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/workspaces');
    });
  });

  // ua: 10. Перенаправлення неавторизованого користувача з приватних сторінок
  it.each(['/workspaces', '/workspaces/123', '/profile'])(
    '10. Повинен перенаправляти неавторизованого користувача з %s на /login',
    async (pathname) => {
      mockIsAuthLoading.value = false;
      mockIsAuthenticated.value = false;
      mockPathname.value = pathname;

      render(
        <AuthProvider>
          <div>Application content</div>
        </AuthProvider>,
      );

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith('/login');
      });
    },
  );

  // ua: 11. Не повинен перенаправляти авторизованого користувача з приватних сторінок
  it('11. Не повинен перенаправляти авторизованого користувача з приватної сторінки', () => {
    mockIsAuthLoading.value = false;
    mockIsAuthenticated.value = true;
    mockPathname.value = '/workspaces/123';

    render(
      <AuthProvider>
        <div>Application content</div>
      </AuthProvider>,
    );

    expect(mockReplace).not.toHaveBeenCalled();
  });

  // ua: 12. Не повинен перенаправляти неавторизованого користувача з публічних сторінок
  it.each(['/', '/login', '/register'])(
    '12. Не повинен перенаправляти неавторизованого користувача зі сторінки %s',
    (pathname) => {
      mockIsAuthLoading.value = false;
      mockIsAuthenticated.value = false;
      mockPathname.value = pathname;

      render(
        <AuthProvider>
          <div>Application content</div>
        </AuthProvider>,
      );

      expect(mockReplace).not.toHaveBeenCalled();
    },
  );
});
