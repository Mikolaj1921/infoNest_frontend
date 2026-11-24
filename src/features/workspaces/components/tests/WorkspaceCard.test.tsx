// ai tests - comp workspace card

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { WorkspaceCard } from '../WorkspaceCard';
import { Workspace, WorkspaceVisibility } from '@/types/workspace';

// ua: моки користувача та модального сховища
const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' } as { id: string } | null,
  onOpen: vi.fn(),
}));

vi.mock('@/store/useAuthStore', () => ({
  useAuthUser: () => mocks.user,
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: mocks.onOpen,
  }),
}));

// ua: мок Link з Next.js
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// ua: мок FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: { iconName?: string } }) => (
    <span data-testid={`icon-${icon.iconName ?? 'unknown'}`} />
  ),
}));

// ua: тестовий воркспейс
const mockWorkspace = {
  id: 'workspace-1',
  name: 'Marketing Team',
  ownerId: 'user-1',
  visibility: WorkspaceVisibility.PRIVATE,
} as Workspace;

describe('WorkspaceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.user = { id: 'user-1' };
  });

  // ua: перевірка основної інформації картки
  it('1. має відображати назву воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(screen.getByText('Marketing Team')).not.toBeNull();
  });

  it('2. має відображати ID воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(screen.getByText('ID: workspace-1')).not.toBeNull();
  });

  it('3. має відображати першу літеру назви у верхньому регістрі', () => {
    render(
      <WorkspaceCard
        workspace={{
          ...mockWorkspace,
          name: 'marketing team',
        }}
      />,
    );

    expect(screen.getByText('M')).not.toBeNull();
  });

  it('4. має містити посилання на сторінку воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    const link = screen.getByRole('link');

    expect(link.getAttribute('href')).toBe('/workspaces/workspace-1');
  });

  it('5. має відображати текст Open space', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(screen.getByText('Open space')).not.toBeNull();
  });

  // ua: перевірка індикатора приватності
  it('6. має відображати індикатор приватного воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(screen.getByTitle('Private workspace')).not.toBeNull();
  });

  it('7. має відображати індикатор публічного воркспейсу', () => {
    render(
      <WorkspaceCard
        workspace={{
          ...mockWorkspace,
          visibility: WorkspaceVisibility.PUBLIC,
        }}
      />,
    );

    expect(screen.getByTitle('Public workspace')).not.toBeNull();
  });

  // ua: перевірка доступності меню керування
  it('8. має відображати меню дій для власника воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    ).not.toBeNull();
  });

  it('9. не має відображати меню дій для іншого користувача', () => {
    mocks.user = { id: 'another-user' };

    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(
      screen.queryByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    ).toBeNull();
  });

  it('10. не має відображати меню дій, якщо користувач не авторизований', () => {
    mocks.user = null;

    render(<WorkspaceCard workspace={mockWorkspace} />);

    expect(
      screen.queryByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    ).toBeNull();
  });

  // ua: відкриття та закриття меню
  it('11. має відкривати меню після натискання кнопки дій', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    );

    expect(screen.getByRole('menu')).not.toBeNull();
    expect(screen.getByText('Rename')).not.toBeNull();
    expect(screen.getByText('Delete')).not.toBeNull();
  });

  it('12. має закривати меню після повторного натискання кнопки дій', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    const actionsButton = screen.getByRole('button', {
      name: 'Workspace actions for Marketing Team',
    });

    fireEvent.click(actionsButton);
    expect(screen.getByRole('menu')).not.toBeNull();

    fireEvent.click(actionsButton);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('13. має закривати меню після натискання Escape', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('14. має закривати меню після кліку за його межами', () => {
    render(
      <div>
        <WorkspaceCard workspace={mockWorkspace} />
        <button type="button">Outside</button>
      </div>,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    );

    expect(screen.getByRole('menu')).not.toBeNull();

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }));

    expect(screen.queryByRole('menu')).toBeNull();
  });

  // ua: перевірка відкриття модальних вікон
  it('15. має відкривати модалку перейменування воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Rename' }));

    expect(mocks.onOpen).toHaveBeenCalledWith('editWorkspace', {
      workspaceId: 'workspace-1',
      workspaceName: 'Marketing Team',
    });

    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('16. має відкривати модалку видалення воркспейсу', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Workspace actions for Marketing Team',
      }),
    );

    fireEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    expect(mocks.onOpen).toHaveBeenCalledWith('deleteWorkspace', {
      workspaceId: 'workspace-1',
      workspaceName: 'Marketing Team',
    });

    expect(screen.queryByRole('menu')).toBeNull();
  });

  // ua: перевірка стану кнопки меню
  it('17. має змінювати aria-expanded після відкриття меню', () => {
    render(<WorkspaceCard workspace={mockWorkspace} />);

    const actionsButton = screen.getByRole('button', {
      name: 'Workspace actions for Marketing Team',
    });

    expect(actionsButton.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(actionsButton);

    expect(actionsButton.getAttribute('aria-expanded')).toBe('true');
  });
});
