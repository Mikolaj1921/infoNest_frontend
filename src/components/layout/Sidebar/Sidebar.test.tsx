// ua: ai тести для Sidebar компонента

import React from 'react';
// ua: імпорти для тестування - vitest та React Testing Library
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
// ua: імпорти компонентів та хуків, які будуть тестуватись
import { Sidebar, getInitials } from './Sidebar';
import { useAuthUser } from '@/store/useAuthStore';
import { usePathname } from 'next/navigation';
import { User } from '@/types/user';

// ua: макетування зовнішніх залежностей - Next.js та Zustand
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthUser: vi.fn(),
}));

// ua: Ізолюємо Sidebar від логіки TanStack Query всередині модалки
vi.mock('@/features/workspaces/components/CreateWorkspaceModal', () => ({
  CreateWorkspaceModal: () => <div data-testid="mock-modal" />,
}));

// ua: фейк юзер для тестів
const mockUser: User = {
  id: 'usr_123',
  name: 'Mikołaj Melnyk',
  email: 'mikolaj@nest.pl',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('Sidebar Component & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  //  ua: ТЕСТ 1: Перевірка чистої логіки функції getInitials
  describe('1. Логіка функції getInitials', () => {
    test('Має повертати "MM" для імені з двох слів "Mikołaj Melnyk"', () => {
      expect(getInitials('Mikołaj Melnyk')).toBe('MM');
    });

    test('Має повертати "MI" (перші дві літери), якщо введено лише одне слово "Mikołaj"', () => {
      expect(getInitials('Mikołaj')).toBe('MI');
    });

    test('Має повертати дефолтний рядок "IN", якщо ім\'я відсутнє або пусте', () => {
      expect(getInitials(undefined)).toBe('IN');
      expect(getInitials('')).toBe('IN');
    });
  });

  // ua: ТЕСТ 2: Перевірка рендерингу живих даних користувача зі стору
  describe('2. Відображення даних профілю користувача', () => {
    test("Має успішно рендерити ім'я, пошту та ініціали залогіненого юзера", () => {
      vi.mocked(useAuthUser).mockReturnValue(mockUser);
      vi.mocked(usePathname).mockReturnValue('/workspaces');

      render(<Sidebar />);

      expect(screen.queryByText('Mikołaj Melnyk')).not.toBeNull();
      expect(screen.queryByText('mikolaj@nest.pl')).not.toBeNull();
      expect(screen.queryByText('MM')).not.toBeNull();
    });

    test('Має показувати лоудер-заглушку, якщо дані користувача ще вантажаться', () => {
      vi.mocked(useAuthUser).mockReturnValue(null);
      vi.mocked(usePathname).mockReturnValue('/workspaces');

      render(<Sidebar />);

      expect(screen.queryByText('Loading user...')).not.toBeNull();
      expect(screen.queryByText('email@example.com')).not.toBeNull();
    });
  });

  //  ua: ТЕСТ 3: Перевірка активних станів посилань навігації
  describe('3. Active link states (integration with usePathname)', () => {
    test('Посилання "Home" має отримувати класи підсвічування, коли pathname === "/workspaces"', () => {
      vi.mocked(useAuthUser).mockReturnValue(mockUser);
      vi.mocked(usePathname).mockReturnValue('/workspaces');

      render(<Sidebar />);

      const homeLink = screen.getByText('Home').closest('a');

      expect(homeLink).not.toBeNull();
      if (homeLink) {
        const hasActiveBg = homeLink.classList.contains('bg-primary/10');
        const hasActiveText = homeLink.classList.contains('text-primary');

        expect(hasActiveBg).toBe(true);
        expect(hasActiveText).toBe(true);
      }
    });

    test('Посилання "Home" НЕ має būti підсвіченим, якщо користувач на іншій сторінці (напр. /profile)', () => {
      vi.mocked(useAuthUser).mockReturnValue(mockUser);
      vi.mocked(usePathname).mockReturnValue('/profile');

      render(<Sidebar />);

      const homeLink = screen.getByText('Home').closest('a');

      expect(homeLink).not.toBeNull();
      if (homeLink) {
        const hasActiveBg = homeLink.classList.contains('bg-primary/10');
        const hasActiveText = homeLink.classList.contains('text-primary');
        const hasMutedText = homeLink.classList.contains(
          'text-muted-foreground',
        );

        expect(hasActiveBg).toBe(false);
        expect(hasActiveText).toBe(false);
        expect(hasMutedText).toBe(true);
      }
    });
  });
});
