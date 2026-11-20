// ai tests - dashboard header component

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DashboardHeader } from './DashboardHeader';

import { useAuthActions, useAuthUser } from '@/store/useAuthStore';

// ua: моки зовнішніх залежностей
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  clearAuth: vi.fn(),
  logout: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  getApiErrorMessage: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthUser: vi.fn(),
  useAuthActions: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  authService: {
    logout: mocks.logout,
  },
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

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <svg data-testid="font-awesome-icon" />,
}));

// ua: тестові дані користувача
const mockUser = {
  id: 'user_1',
  name: 'Mikolaj Melnyk',
  email: 'mikolaj@example.com',
};

const mockUserWithoutName = {
  id: 'user_2',
  name: '',
  email: 'user@example.com',
};

// ua: допоміжна функція для рендерингу компонента
const renderDashboardHeader = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardHeader />
    </QueryClientProvider>,
  );
};

// ua: допоміжна функція для відкриття меню профілю
const openProfileDropdown = () => {
  const avatar = screen.getByText('MM');
  const avatarButton = avatar.closest('button');

  expect(avatarButton).toBeTruthy();

  fireEvent.click(avatarButton as HTMLButtonElement);
};

describe('DashboardHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ua: стандартний стан користувача
    vi.mocked(useAuthUser).mockReturnValue(
      mockUser as ReturnType<typeof useAuthUser>,
    );

    vi.mocked(useAuthActions).mockReturnValue({
      clearAuth: mocks.clearAuth,
    } as unknown as ReturnType<typeof useAuthActions>);

    mocks.logout.mockResolvedValue({
      message: 'Logged out successfully',
    });

    mocks.getApiErrorMessage.mockReturnValue('Logout failed');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // =====================================================
  // 1. BASIC RENDERING
  // =====================================================

  describe('1. Basic rendering', () => {
    test('1.1. Повинен правильно відображати DashboardHeader', () => {
      renderDashboardHeader();

      expect(screen.getByText('Workspaces')).toBeTruthy();
      expect(screen.getByText('infoNest Space')).toBeTruthy();
    });

    test('1.2. Повинен відображати кнопку пошуку', () => {
      renderDashboardHeader();

      expect(screen.getByText('Search...')).toBeTruthy();
      expect(screen.getByText('Ctrl K')).toBeTruthy();
    });

    test('1.3. Повинен відображати кнопку Invite', () => {
      renderDashboardHeader();

      expect(screen.getByRole('button', { name: /invite/i })).toBeTruthy();
    });

    test('1.4. Повинен відображати іконки FontAwesome', () => {
      renderDashboardHeader();

      expect(screen.getAllByTestId('font-awesome-icon').length).toBeGreaterThan(
        0,
      );
    });
  });

  // =====================================================
  // 2. USER AVATAR AND INITIALS
  // =====================================================

  describe('2. User avatar and initials', () => {
    test('2.1. Повинен формувати ініціали з імені та прізвища', () => {
      renderDashboardHeader();

      expect(screen.getByText('MM')).toBeTruthy();
    });

    test('2.2. Повинен формувати ініціали з одного слова', () => {
      vi.mocked(useAuthUser).mockReturnValue({
        ...mockUser,
        name: 'Alexander',
      } as ReturnType<typeof useAuthUser>);

      renderDashboardHeader();

      expect(screen.getByText('AL')).toBeTruthy();
    });

    test('2.3. Повинен використовувати IN, якщо ім’я відсутнє', () => {
      vi.mocked(useAuthUser).mockReturnValue(
        mockUserWithoutName as ReturnType<typeof useAuthUser>,
      );

      renderDashboardHeader();

      expect(screen.getByText('IN')).toBeTruthy();
    });

    test('2.4. Повинен використовувати IN, якщо користувач відсутній', () => {
      vi.mocked(useAuthUser).mockReturnValue(
        null as ReturnType<typeof useAuthUser>,
      );

      renderDashboardHeader();

      expect(screen.getByText('IN')).toBeTruthy();
    });
  });

  // =====================================================
  // 3. PROFILE DROPDOWN
  // =====================================================

  describe('3. Profile dropdown', () => {
    test('3.1. Меню профілю спочатку повинно бути закритим', () => {
      renderDashboardHeader();

      expect(screen.queryByText('My Profile')).toBeNull();

      expect(screen.queryByText('Logout')).toBeNull();
    });

    test('3.2. Повинен відкривати меню після натискання на аватар', () => {
      renderDashboardHeader();

      openProfileDropdown();

      expect(screen.getByText('My Profile')).toBeTruthy();
      expect(screen.getByText('Logout')).toBeTruthy();
    });

    test('3.3. Повинен відображати ім’я та email користувача', () => {
      renderDashboardHeader();

      openProfileDropdown();

      expect(screen.getByText('Mikolaj Melnyk')).toBeTruthy();
      expect(screen.getByText('mikolaj@example.com')).toBeTruthy();
    });

    test('3.4. Повинен використовувати fallback для відсутніх даних користувача', () => {
      vi.mocked(useAuthUser).mockReturnValue(
        null as ReturnType<typeof useAuthUser>,
      );

      renderDashboardHeader();

      const avatarButton = screen.getByText('IN').closest('button');

      expect(avatarButton).toBeTruthy();

      fireEvent.click(avatarButton as HTMLButtonElement);

      expect(screen.getByText('User')).toBeTruthy();
      expect(screen.getByText('email@example.com')).toBeTruthy();
    });

    test('3.5. Повинен закривати меню після повторного натискання на аватар', () => {
      renderDashboardHeader();

      openProfileDropdown();

      expect(screen.getByText('My Profile')).toBeTruthy();

      fireEvent.click(
        screen.getByText('MM').closest('button') as HTMLButtonElement,
      );

      expect(screen.queryByText('My Profile')).toBeNull();
    });

    test('3.6. Повинен закривати меню після кліку поза його межами', () => {
      renderDashboardHeader();

      openProfileDropdown();

      expect(screen.getByText('My Profile')).toBeTruthy();

      fireEvent.mouseDown(document.body);

      expect(screen.queryByText('My Profile')).toBeNull();
      expect(screen.queryByText('Logout')).toBeNull();
    });
  });

  // =====================================================
  // 4. PROFILE NAVIGATION
  // =====================================================

  describe('4. Profile navigation', () => {
    test('4.1. Повинен переходити на сторінку профілю', () => {
      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('My Profile'));

      expect(mocks.push).toHaveBeenCalledWith('/profile');
    });

    test('4.2. Повинен закривати меню після переходу на профіль', () => {
      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('My Profile'));

      expect(screen.queryByText('My Profile')).toBeNull();
      expect(screen.queryByText('Logout')).toBeNull();
    });
  });

  // =====================================================
  // 5. LOGOUT
  // =====================================================

  describe('5. Logout', () => {
    test('5.1. Повинен викликати logout після натискання кнопки', async () => {
      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mocks.logout).toHaveBeenCalledTimes(1);
      });
    });

    test('5.2. Повинен очищати авторизаційний стан після успішного logout', async () => {
      // ua: приглушуємо повідомлення jsdom про непідтримувану навігацію
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mocks.clearAuth).toHaveBeenCalledTimes(1);
      });

      expect(mocks.toastSuccess).toHaveBeenCalledWith(
        'Logged out successfully',
      );

      consoleErrorSpy.mockRestore();
    });

    test('5.3. Повинен використовувати стандартне повідомлення, якщо сервер не повернув message', async () => {
      mocks.logout.mockResolvedValue({});

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mocks.toastSuccess).toHaveBeenCalledWith(
          'Logged out successfully',
        );
      });

      consoleErrorSpy.mockRestore();
    });

    test('5.4. Повинен показувати повідомлення про помилку при невдалому logout', async () => {
      mocks.logout.mockRejectedValue(new Error('Server error'));

      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mocks.getApiErrorMessage).toHaveBeenCalled();
        expect(mocks.toastError).toHaveBeenCalledWith('Logout failed');
      });
    });

    test('5.5. Повинен не очищати авторизаційний стан при помилці logout', async () => {
      mocks.logout.mockRejectedValue(new Error('Server error'));

      renderDashboardHeader();

      openProfileDropdown();

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(mocks.toastError).toHaveBeenCalled();
      });

      expect(mocks.clearAuth).not.toHaveBeenCalled();
    });

    test('5.6. Повинен блокувати кнопку профілю під час виконання logout', async () => {
      let resolveLogout: (value: { message: string }) => void = () => {};

      // ua: створюємо запит, який залишається незавершеним до ручного resolve
      mocks.logout.mockImplementation(
        () =>
          new Promise<{ message: string }>((resolve) => {
            resolveLogout = resolve;
          }),
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderDashboardHeader();

        openProfileDropdown();

        // ua: отримуємо кнопку профілю до запуску logout
        const avatarButton = screen
          .getByText('MM')
          .closest('button') as HTMLButtonElement;

        // ua: запускаємо logout
        fireEvent.click(screen.getByText('Logout'));

        await waitFor(() => {
          expect(mocks.logout).toHaveBeenCalledTimes(1);
        });

        // ua: кнопка профілю повинна бути заблокована під час запиту
        await waitFor(() => {
          expect(avatarButton.disabled).toBe(true);
        });

        // ua: меню закривається, тому що кнопка профілю стає disabled
        expect(screen.queryByText('Logout')).toBeNull();

        // ua: завершуємо запит
        resolveLogout({ message: 'Logged out successfully' });

        await waitFor(() => {
          expect(mocks.clearAuth).toHaveBeenCalledTimes(1);
        });
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
