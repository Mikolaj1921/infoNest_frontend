import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Sidebar, getInitials } from './Sidebar';
import { User } from '@/types/user';

// ua: моки зовнішніх залежностей
const mocks = vi.hoisted(() => ({
  usePathname: vi.fn(),
  useParams: vi.fn(),
  getSearchParam: vi.fn(),
  useAuthUser: vi.fn(),
  useWorkspaces: vi.fn(),
  useWorkspaceStructure: vi.fn(),
  onOpen: vi.fn(),
  navTree: vi.fn(),
  sidebarSkeleton: vi.fn(),
  createWorkspaceModal: vi.fn(),
}));

// ua: мок навігації Next.js
vi.mock('next/navigation', () => ({
  usePathname: mocks.usePathname,
  useParams: mocks.useParams,
  useSearchParams: () => ({
    get: mocks.getSearchParam,
  }),
}));

// ua: мок Zustand-стору користувача
vi.mock('@/store/useAuthStore', () => ({
  useAuthUser: mocks.useAuthUser,
}));

// ua: мок отримання воркспейсів
vi.mock('@/features/workspaces/hooks/useWorkspaces', () => ({
  useWorkspaces: mocks.useWorkspaces,
}));

// ua: мок структури воркспейсу
vi.mock('@/features/documents/hooks/useWorkspaceStructure', () => ({
  useWorkspaceStructure: mocks.useWorkspaceStructure,
}));

// ua: мок modal store
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: mocks.onOpen,
  }),
}));

// ua: мок Next.js Link
vi.mock('next/link', () => ({
  // eslint-disable-next-line
  default: ({ href, children, onClick, ...props }: any) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
}));

// ua: мок дерева документів
vi.mock('@/features/documents/components/NavTree', () => ({
  // eslint-disable-next-line
  NavTree: (props: any) => {
    mocks.navTree(props);

    return <div data-testid="nav-tree">Navigation tree</div>;
  },
}));

// ua: мок skeleton сайдбару
vi.mock('@/components/ui/skeletons/SidebarSkeleton', () => ({
  SidebarSkeleton: () => {
    mocks.sidebarSkeleton();

    return <div data-testid="sidebar-skeleton">Loading...</div>;
  },
}));

// ua: мок модалки створення воркспейсу
vi.mock('@/features/workspaces/components/CreateWorkspaceModal', () => ({
  // eslint-disable-next-line
  CreateWorkspaceModal: (props: any) => {
    mocks.createWorkspaceModal(props);

    if (!props.isOpen) {
      return null;
    }

    return (
      <div data-testid="create-workspace-modal">
        <button type="button" onClick={props.onClose}>
          Close modal
        </button>
      </div>
    );
  },
}));

// ua: тестовий користувач
const mockUser: User = {
  id: 'usr_123',
  name: 'Mikołaj Melnyk',
  email: 'mikolaj@nest.pl',
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

// ua: тестові воркспейси
const mockWorkspaces = [
  {
    id: 'ws_test_1',
    name: 'Personal Workspace',
    ownerId: 'usr_123',
  },
  {
    id: 'ws_test_2',
    name: 'Project Workspace',
    ownerId: 'usr_123',
  },
  {
    id: 'ws_test_3',
    name: 'Shared Workspace',
    ownerId: 'another_user',
  },
];

// ua: допоміжна функція для пошуку кнопки розгортання воркспейсу
const getWorkspaceToggleButton = (workspaceName: string) => {
  const workspaceButton = screen
    .getAllByRole('button')
    .find(
      (button) =>
        button.getAttribute('aria-expanded') !== null &&
        button.textContent?.includes(workspaceName),
    );

  expect(workspaceButton).toBeTruthy();

  return workspaceButton as HTMLButtonElement;
};

// ua: допоміжна функція для рендерингу Sidebar
type RenderSidebarOptions = {
  pathname?: string;
  workspaceId?: string;
  tab?: string | null;
  workspaces?: typeof mockWorkspaces | undefined;
  isLoading?: boolean;
  user?: User | null;
  structure?: {
    // eslint-disable-next-line
    data: any;
    isLoading: boolean;
  };
};

const renderSidebar = (options: RenderSidebarOptions = {}) => {
  const {
    pathname = '/workspaces',
    workspaceId = 'ws_test_1',
    tab = null,
    isLoading = false,
    user = mockUser,
    structure = { data: [], isLoading: false },
  } = options;

  // ua: перевіряємо наявність властивості окремо, щоб undefined не замінювався mockWorkspaces
  const workspaces = Object.prototype.hasOwnProperty.call(options, 'workspaces')
    ? options.workspaces
    : mockWorkspaces;

  mocks.usePathname.mockReturnValue(pathname);
  mocks.useParams.mockReturnValue({ id: workspaceId });
  mocks.getSearchParam.mockImplementation((key: string) =>
    key === 'tab' ? tab : null,
  );

  mocks.useAuthUser.mockReturnValue(user);

  mocks.useWorkspaces.mockReturnValue({
    data: workspaces,
    isLoading,
  });

  mocks.useWorkspaceStructure.mockReturnValue(structure);

  return render(<Sidebar />);
};

describe('Sidebar Component & Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.usePathname.mockReturnValue('/workspaces');
    mocks.useParams.mockReturnValue({ id: 'ws_test_1' });
    mocks.getSearchParam.mockReturnValue(null);

    mocks.useAuthUser.mockReturnValue(mockUser);

    mocks.useWorkspaces.mockReturnValue({
      data: mockWorkspaces,
      isLoading: false,
    });

    mocks.useWorkspaceStructure.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  // =====================================================
  // 1. ЛОГІКА GET INITIALS
  // =====================================================

  describe('1. getInitials', () => {
    test('повертає ініціали для імені з двох слів', () => {
      expect(getInitials('Mikołaj Melnyk')).toBe('MM');
    });

    test('повертає перші дві літери для одного слова', () => {
      expect(getInitials('Mikołaj')).toBe('MI');
    });

    test('повертає дефолтне значення IN, якщо ім’я відсутнє', () => {
      expect(getInitials(undefined)).toBe('IN');
      expect(getInitials('')).toBe('IN');
    });

    test('коректно обробляє ім’я з декількома пробілами', () => {
      expect(getInitials('  Mikołaj   Melnyk  ')).toBe('MM');
    });

    test('повертає ініціали у верхньому регістрі', () => {
      expect(getInitials('mikołaj melnyk')).toBe('MM');
    });
  });

  // =====================================================
  // 2. ВІДОБРАЖЕННЯ SIDEBAR
  // =====================================================

  describe('2. Basic rendering', () => {
    test('рендерить основну структуру сайдбару', () => {
      renderSidebar();

      expect(screen.getByRole('complementary')).toBeTruthy();
      expect(screen.getByText('infoNest Space')).toBeTruthy();
      expect(screen.getByText('Home')).toBeTruthy();
      expect(screen.getByText('Search')).toBeTruthy();
      expect(screen.getByText('Workspaces')).toBeTruthy();
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    test('рендерить посилання на головні сторінки', () => {
      renderSidebar();

      expect(screen.getByRole('link', { name: /Home/i })).toBeTruthy();
      expect(screen.getByRole('link', { name: /Settings/i })).toBeTruthy();
      expect(
        screen.getByRole('link', { name: /infoNest Space/i }),
      ).toBeTruthy();
    });

    test('рендерить дані авторизованого користувача', () => {
      renderSidebar();

      expect(screen.getByText('Mikołaj Melnyk')).toBeTruthy();
      expect(screen.getByText('mikolaj@nest.pl')).toBeTruthy();

      expect(screen.getAllByText('MM').length).toBeGreaterThan(0);
    });

    test('показує заглушку, якщо користувач ще не завантажений', () => {
      renderSidebar({ user: null });

      expect(screen.getByText('Loading user...')).toBeTruthy();
      expect(screen.getByText('email@example.com')).toBeTruthy();

      // ua: IN відображається і в логотипі, і в аватарі користувача
      expect(screen.getAllByText('IN').length).toBe(2);
    });
  });

  // =====================================================
  // 3. НАВІГАЦІЯ
  // =====================================================

  describe('3. Navigation', () => {
    test('підсвічує Home на сторінці /workspaces', () => {
      renderSidebar({ pathname: '/workspaces' });

      const homeLink = screen.getByRole('link', { name: /Home/i });

      expect(homeLink.classList.contains('bg-primary/10')).toBe(true);
      expect(homeLink.classList.contains('text-primary')).toBe(true);
    });

    test('не підсвічує Home на іншій сторінці', () => {
      renderSidebar({ pathname: '/profile' });

      const homeLink = screen.getByRole('link', { name: /Home/i });

      expect(homeLink.classList.contains('bg-primary/10')).toBe(false);
      expect(homeLink.classList.contains('text-primary')).toBe(false);
    });

    test('підсвічує Settings на сторінці профілю', () => {
      renderSidebar({ pathname: '/profile' });

      const settingsLink = screen.getByRole('link', {
        name: /Settings/i,
      });

      expect(settingsLink.classList.contains('bg-primary/10')).toBe(true);
      expect(settingsLink.classList.contains('text-primary')).toBe(true);
    });

    test('відображає посилання на розділи поточного воркспейсу', () => {
      renderSidebar();

      expect(screen.getByText('Documents')).toBeTruthy();
      expect(screen.getByText('Tasks (Kanban)')).toBeTruthy();
      expect(screen.getByText('Whiteboard')).toBeTruthy();
    });

    test('формує правильні посилання для розділів воркспейсу', () => {
      renderSidebar();

      expect(
        screen.getByRole('link', { name: /Documents/i }).getAttribute('href'),
      ).toBe('/workspaces/ws_test_1');

      expect(
        screen
          .getByRole('link', { name: /Tasks \(Kanban\)/i })
          .getAttribute('href'),
      ).toBe('/workspaces/ws_test_1?tab=kanban');

      expect(
        screen.getByRole('link', { name: /Whiteboard/i }).getAttribute('href'),
      ).toBe('/workspaces/ws_test_1?tab=whiteboard');
    });

    test('підсвічує активний розділ Kanban', () => {
      renderSidebar({
        pathname: '/workspaces/ws_test_1',
        tab: 'kanban',
      });

      const kanbanLink = screen.getByRole('link', {
        name: /Tasks \(Kanban\)/i,
      });

      expect(kanbanLink.classList.contains('bg-primary/10')).toBe(true);
      expect(kanbanLink.classList.contains('text-primary')).toBe(true);
    });

    test('підсвічує активний розділ Whiteboard', () => {
      renderSidebar({
        pathname: '/workspaces/ws_test_1',
        tab: 'whiteboard',
      });

      const whiteboardLink = screen.getByRole('link', {
        name: /Whiteboard/i,
      });

      expect(whiteboardLink.classList.contains('bg-primary/10')).toBe(true);
      expect(whiteboardLink.classList.contains('text-primary')).toBe(true);
    });
  });

  // =====================================================
  // 4. СПИСОК WORKSPACES
  // =====================================================

  describe('4. Workspaces list', () => {
    test('відображає всі воркспейси', () => {
      renderSidebar();

      expect(screen.getByText('Personal Workspace')).toBeTruthy();
      expect(screen.getByText('Project Workspace')).toBeTruthy();
      expect(screen.getByText('Shared Workspace')).toBeTruthy();
    });

    test('показує skeleton під час завантаження воркспейсів', () => {
      renderSidebar({ isLoading: true });

      expect(screen.getByTestId('sidebar-skeleton')).toBeTruthy();
      expect(screen.queryByText('Personal Workspace')).toBeNull();
    });

    test('показує повідомлення, якщо воркспейсів немає', () => {
      renderSidebar({ workspaces: [] });

      expect(screen.getByText('No workspaces found')).toBeTruthy();
      expect(screen.queryByTestId('sidebar-skeleton')).toBeNull();
    });

    test('показує повідомлення, якщо список воркспейсів undefined', () => {
      renderSidebar({ workspaces: undefined });

      expect(screen.getByText('No workspaces found')).toBeTruthy();
    });

    test('автоматично розгортає поточний воркспейс', () => {
      renderSidebar();

      const workspaceButton = getWorkspaceToggleButton('Personal Workspace');

      expect(workspaceButton.getAttribute('aria-expanded')).toBe('true');
    });

    test('інші воркспейси спочатку згорнуті', () => {
      renderSidebar();

      const workspaceButton = getWorkspaceToggleButton('Project Workspace');

      expect(workspaceButton.getAttribute('aria-expanded')).toBe('false');
    });

    test('дозволяє розгорнути та згорнути воркспейс', () => {
      renderSidebar();

      const workspaceButton = getWorkspaceToggleButton('Project Workspace');

      expect(workspaceButton.getAttribute('aria-expanded')).toBe('false');

      fireEvent.click(workspaceButton);

      expect(workspaceButton.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(workspaceButton);

      expect(workspaceButton.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // =====================================================
  // 5. ДОКУМЕНТИ ТА КАТЕГОРІЇ
  // =====================================================

  describe('5. Workspace documents', () => {
    test('показує повідомлення, якщо категорій немає', () => {
      renderSidebar({
        structure: {
          data: [],
          isLoading: false,
        },
      });

      expect(screen.getByText('No categories found')).toBeTruthy();
    });

    test('показує skeleton під час завантаження структури воркспейсу', () => {
      renderSidebar({
        structure: {
          data: undefined,
          isLoading: true,
        },
      });

      expect(screen.getByTestId('sidebar-skeleton')).toBeTruthy();
    });

    test('відображає NavTree, якщо категорії існують', () => {
      const categories = [
        {
          id: 'category_1',
          name: 'Development',
          documents: [],
        },
      ];

      renderSidebar({
        structure: {
          data: categories,
          isLoading: false,
        },
      });

      expect(screen.getByTestId('nav-tree')).toBeTruthy();
      expect(mocks.navTree).toHaveBeenCalledTimes(1);
      expect(mocks.navTree).toHaveBeenCalledWith({
        categories,
      });
    });

    test('передає правильний workspaceId до useWorkspaceStructure', () => {
      renderSidebar();

      expect(mocks.useWorkspaceStructure).toHaveBeenCalledWith('ws_test_1');
    });

    test('відкриває створення категорії через modal store', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Create folder in Personal Workspace',
        }),
      );

      expect(mocks.onOpen).toHaveBeenCalledWith('createCategory');
    });

    test('не показує кнопку створення категорії для іншого воркспейсу', () => {
      renderSidebar();

      const workspaceButton = getWorkspaceToggleButton('Project Workspace');

      fireEvent.click(workspaceButton);

      expect(
        screen.queryByRole('button', {
          name: 'Create folder in Project Workspace',
        }),
      ).toBeNull();
    });
  });

  // =====================================================
  // 6. WORKSPACE ACTIONS
  // =====================================================

  describe('6. Workspace actions', () => {
    test('власник бачить кнопку дій воркспейсу', () => {
      renderSidebar();

      expect(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      ).toBeTruthy();
    });

    test('користувач, який не є власником, не бачить кнопку дій', () => {
      renderSidebar();

      expect(
        screen.queryByRole('button', {
          name: 'Actions for Shared Workspace',
        }),
      ).toBeNull();
    });

    test('відкриває меню дій воркспейсу', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      );

      expect(screen.getByText('Rename')).toBeTruthy();
      expect(screen.getByText('Delete')).toBeTruthy();
    });

    test('закриває меню дій після повторного натискання', () => {
      renderSidebar();

      const actionsButton = screen.getByRole('button', {
        name: 'Actions for Personal Workspace',
      });

      fireEvent.click(actionsButton);

      expect(screen.getByText('Rename')).toBeTruthy();

      fireEvent.click(actionsButton);

      expect(screen.queryByText('Rename')).toBeNull();
    });

    test('відкриває модалку перейменування воркспейсу', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      );

      fireEvent.click(screen.getByText('Rename'));

      expect(mocks.onOpen).toHaveBeenCalledWith('editWorkspace', {
        workspaceId: 'ws_test_1',
        workspaceName: 'Personal Workspace',
      });

      expect(screen.queryByText('Rename')).toBeNull();
    });

    test('відкриває модалку видалення воркспейсу', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      );

      fireEvent.click(screen.getByText('Delete'));

      expect(mocks.onOpen).toHaveBeenCalledWith('deleteWorkspace', {
        workspaceId: 'ws_test_1',
        workspaceName: 'Personal Workspace',
      });

      expect(screen.queryByText('Delete')).toBeNull();
    });

    test('закриває меню дій після натискання Escape', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      );

      expect(screen.getByText('Rename')).toBeTruthy();

      fireEvent.keyDown(document, {
        key: 'Escape',
      });

      expect(screen.queryByText('Rename')).toBeNull();
    });

    test('закриває меню дій після кліку за його межами', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Actions for Personal Workspace',
        }),
      );

      expect(screen.getByText('Rename')).toBeTruthy();

      fireEvent.pointerDown(document.body);

      expect(screen.queryByText('Rename')).toBeNull();
    });
  });

  // =====================================================
  // 7. CREATE WORKSPACE MODAL
  // =====================================================

  describe('7. Create workspace modal', () => {
    test('модалка спочатку закрита', () => {
      renderSidebar();

      expect(screen.queryByTestId('create-workspace-modal')).toBeNull();
    });

    test('відкриває модалку після натискання Create workspace', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Create workspace',
        }),
      );

      expect(screen.getByTestId('create-workspace-modal')).toBeTruthy();
    });

    test('закриває модалку після виклику onClose', () => {
      renderSidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Create workspace',
        }),
      );

      expect(screen.getByTestId('create-workspace-modal')).toBeTruthy();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Close modal',
        }),
      );

      expect(screen.queryByTestId('create-workspace-modal')).toBeNull();
    });
  });

  // =====================================================
  // 8. MOBILE SIDEBAR
  // =====================================================

  describe('8. Mobile sidebar', () => {
    test('мобільне меню спочатку закрите', () => {
      renderSidebar();

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Menu',
      });

      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });

    test('відкриває мобільне меню', () => {
      renderSidebar();

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Menu',
      });

      fireEvent.click(toggleButton);

      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');
    });

    test('закриває мобільне меню після повторного натискання', () => {
      renderSidebar();

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Menu',
      });

      fireEvent.click(toggleButton);
      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

      fireEvent.click(toggleButton);
      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });

    test('закриває мобільне меню після кліку на overlay', () => {
      const { container } = renderSidebar();

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Menu',
      });

      fireEvent.click(toggleButton);

      expect(toggleButton.getAttribute('aria-expanded')).toBe('true');

      const overlay = container.querySelector('.fixed.inset-0');

      expect(overlay).not.toBeNull();

      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });

    test('закриває мобільне меню після переходу за посиланням Home', () => {
      renderSidebar();

      const toggleButton = screen.getByRole('button', {
        name: 'Toggle Menu',
      });

      fireEvent.click(toggleButton);

      fireEvent.click(screen.getByRole('link', { name: /Home/i }));

      expect(toggleButton.getAttribute('aria-expanded')).toBe('false');
    });
  });

  // =====================================================
  // 9. SIDEBAR RESIZING
  // =====================================================

  describe('9. Sidebar resizing', () => {
    test('має початкову ширину 256px', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('256');
    });

    test('збільшує ширину клавішею ArrowRight', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'ArrowRight',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('266');
    });

    test('зменшує ширину клавішею ArrowLeft', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'ArrowLeft',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('246');
    });

    test('встановлює мінімальну ширину клавішею Home', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'Home',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('220');
    });

    test('встановлює максимальну ширину клавішею End', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'End',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('480');
    });

    test('не дозволяє зменшити ширину нижче 220px', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'Home',
      });

      fireEvent.keyDown(separator, {
        key: 'ArrowLeft',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('220');
    });

    test('не дозволяє збільшити ширину понад 480px', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'End',
      });

      fireEvent.keyDown(separator, {
        key: 'ArrowRight',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('480');
    });

    test('повертає стандартну ширину після подвійного кліку', () => {
      renderSidebar();

      const separator = screen.getByRole('separator', {
        name: 'Resize sidebar',
      });

      fireEvent.keyDown(separator, {
        key: 'End',
      });

      expect(separator.getAttribute('aria-valuenow')).toBe('480');

      fireEvent.doubleClick(separator);

      expect(separator.getAttribute('aria-valuenow')).toBe('256');
    });
  });
});
