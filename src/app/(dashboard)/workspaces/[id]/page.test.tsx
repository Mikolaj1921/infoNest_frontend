'use client';

// tests for the WorkspacePage component, focusing on tabs, documents, kanban, whiteboard, and user interactions
// ai tests

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from '@tanstack/react-query';
import WorkspacePage from './page';
import { useModal } from '@/hooks/use-modal-store';
import {
  useWorkspaceKanban,
  useCreateColumn,
  useReorderTasks,
  useReorderCategories,
} from '@/features/kanban/hooks/useKanbanData';
import { useWorkspaceStructure } from '@/features/documents/hooks/useWorkspaceStructure';
import type { TaskCategory } from '@/types/kanban';

// ua: Мокаємо навігацію Next.js та менеджер модальних вікон
const mocks = vi.hoisted(() => ({
  routerReplace: vi.fn(),
  mockOpen: vi.fn(),
  activeTab: null as string | null,
  searchString: '',
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws_123' }),
  useRouter: () => ({
    replace: mocks.routerReplace,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === 'tab' ? mocks.activeTab : null),
    toString: () => mocks.searchString,
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{
    href: string;
    className?: string;
  }>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="mock-icon" />,
}));

// ua: Мокаємо менеджер модалок Zustand
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

// ua: Мокаємо хуки Kanban
vi.mock('@/hooks/useKanbanData', () => ({
  useWorkspaceKanban: vi.fn(),
  useCreateColumn: vi.fn(),
  useReorderTasks: vi.fn(),
  useReorderCategories: vi.fn(),
}));

// ua: Мокаємо отримання структури документів
vi.mock('@/features/documents/hooks/useWorkspaceStructure', () => ({
  useWorkspaceStructure: vi.fn(),
}));

// ua: Мокаємо DnD, оскільки його внутрішня логіка тестується окремо
vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({ children }: React.PropsWithChildren) => (
    <div data-testid="drag-drop-provider">{children}</div>
  ),
}));

vi.mock('@dnd-kit/react/sortable', () => ({
  isSortable: vi.fn(),
}));

vi.mock('@dnd-kit/helpers', () => ({
  move: vi.fn(),
}));

// ua: Мокаємо компонент колонки Kanban
vi.mock('@/features/kanban/components/BoardColumn', () => ({
  BoardColumn: ({
    column,
    index,
    onAddTask,
  }: {
    column: TaskCategory;
    index: number;
    onAddTask: (columnId: string) => void;
  }) => (
    <div data-testid={`board-column-${column.id}`}>
      <span>{column.name}</span>
      <span data-testid={`column-index-${column.id}`}>{index}</span>
      <button type="button" onClick={() => onAddTask(column.id)}>
        Add task to {column.name}
      </button>
    </div>
  ),
}));

// ua: Мокаємо Whiteboard, оскільки він тестується окремо
vi.mock('@/features/whiteboard/components/WhiteboardWrapper', () => ({
  default: ({ workspaceId }: { workspaceId: string }) => (
    <div data-testid="whiteboard-wrapper">{workspaceId}</div>
  ),
}));

// ua: Типи змінних для mutation-хуків беремо безпосередньо з їхніх типів
type ReorderTasksVariables = Parameters<
  ReturnType<typeof useReorderTasks>['mutate']
>[0];

type ReorderCategoriesVariables = Parameters<
  ReturnType<typeof useReorderCategories>['mutate']
>[0];

describe('Page Component: WorkspacePage UI & Functionality', () => {
  let queryClient: QueryClient;

  const mockCategories = [
    {
      id: 'cat_1',
      name: 'Development',
      documents: [
        {
          id: 'doc_1',
          title: 'Project Documentation',
        },
        {
          id: 'doc_2',
          title: 'Technical Notes',
        },
      ],
    },
    {
      id: 'cat_2',
      name: 'Research',
      documents: [],
    },
  ];

  const mockKanbanCategories: TaskCategory[] = [
    {
      id: 'column_1',
      workspaceId: 'ws_123',
      name: 'To Do',
      position: 0,
      boardTasks: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'column_2',
      workspaceId: 'ws_123',
      name: 'In Progress',
      position: 1,
      boardTasks: [],
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    mocks.activeTab = null;
    mocks.searchString = '';

    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: mocks.mockOpen,
      onClose: vi.fn(),
    });

    vi.mocked(useWorkspaceKanban).mockReturnValue({
      data: mockKanbanCategories,
      isLoading: false,
    } as ReturnType<typeof useWorkspaceKanban>);

    vi.mocked(useWorkspaceStructure).mockReturnValue({
      data: mockCategories,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useWorkspaceStructure>);

    // ua: Створюємо справжні результати useMutation із тестовими mutationFn
    vi.mocked(useCreateColumn).mockImplementation(() =>
      useMutation({
        // eslint-disable-next-line
        mutationFn: async (_name: string): Promise<TaskCategory> =>
          mockKanbanCategories[0],
      }),
    );

    vi.mocked(useReorderTasks).mockImplementation(() =>
      useMutation<void, Error, ReorderTasksVariables>({
        // eslint-disable-next-line
        mutationFn: async (_variables) => undefined,
      }),
    );

    vi.mocked(useReorderCategories).mockImplementation(() =>
      useMutation<void, Error, ReorderCategoriesVariables>({
        // eslint-disable-next-line
        mutationFn: async (_variables) => undefined,
      }),
    );
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('1. Початкове відображення вкладки Documents за замовчуванням', () => {
    render(<WorkspacePage />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Documents' })).toBeTruthy();
    expect(
      screen.getByText(
        'Browse your knowledge base and organize documents by category.',
      ),
    ).toBeTruthy();

    expect(screen.getByText('Development')).toBeTruthy();
    expect(screen.getByText('Research')).toBeTruthy();

    expect(screen.getByRole('button', { name: /documents/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /tasks kanban/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /whiteboard/i })).toBeTruthy();
  });

  test('2. Відображення документів усередині відповідних категорій', () => {
    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText('Project Documentation')).toBeTruthy();
    expect(screen.getByText('Technical Notes')).toBeTruthy();

    expect(screen.getByText('2 documents')).toBeTruthy();
    expect(screen.getByText('This category is empty.')).toBeTruthy();
  });

  test('3. Правильне формування посилання на сторінку документа', () => {
    render(<WorkspacePage />, { wrapper });

    const documentLink = screen.getByRole('link', {
      name: /project documentation/i,
    });

    expect(documentLink.getAttribute('href')).toBe(
      '/workspaces/ws_123/documents/doc_1',
    );
  });

  test('4. Відображення стану завантаження категорій документів', () => {
    vi.mocked(useWorkspaceStructure).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useWorkspaceStructure>);

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText('Loading documents...')).toBeTruthy();
  });

  test('5. Відображення повідомлення про помилку завантаження документів', () => {
    vi.mocked(useWorkspaceStructure).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useWorkspaceStructure>);

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText('Failed to load documents.')).toBeTruthy();
    expect(screen.getByText('Please try again in a moment.')).toBeTruthy();
  });

  test('6. Відображення заглушки, якщо категорії документів відсутні', () => {
    vi.mocked(useWorkspaceStructure).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useWorkspaceStructure>);

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText('Your knowledge base is empty')).toBeTruthy();

    expect(
      screen.getByText(
        'Create a category in the sidebar to start organizing your documents.',
      ),
    ).toBeTruthy();

    expect(
      screen.getByRole('button', { name: /create category/i }),
    ).toBeTruthy();
  });

  test('7. Відкриття модального вікна створення категорії', () => {
    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /new category/i }));

    expect(mocks.mockOpen).toHaveBeenCalledWith('createCategory');
  });

  test('8. Відкриття модального вікна редагування категорії з правильними даними', () => {
    render(<WorkspacePage />, { wrapper });

    fireEvent.click(
      screen.getByRole('button', {
        name: /edit category development/i,
      }),
    );

    expect(mocks.mockOpen).toHaveBeenCalledWith('editCategory', {
      categoryId: 'cat_1',
      categoryName: 'Development',
    });
  });

  test('9. Відкриття модального вікна видалення категорії з правильними даними', () => {
    render(<WorkspacePage />, { wrapper });

    fireEvent.click(
      screen.getByRole('button', {
        name: /delete category development/i,
      }),
    );

    expect(mocks.mockOpen).toHaveBeenCalledWith('deleteCategory', {
      categoryId: 'cat_1',
      categoryName: 'Development',
    });
  });

  test('10. Відкриття модального вікна створення документа в потрібній категорії', () => {
    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByTitle('Add document to Development'));

    expect(mocks.mockOpen).toHaveBeenCalledWith('createDocument', {
      categoryId: 'cat_1',
      categoryName: 'Development',
    });
  });

  test('11. Перехід на вкладку Kanban оновлює URL без перезавантаження сторінки', () => {
    mocks.searchString = 'filter=active';

    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /tasks kanban/i }));

    expect(mocks.routerReplace).toHaveBeenCalledWith(
      '/workspaces/ws_123?filter=active&tab=kanban',
      { scroll: false },
    );
  });

  test('12. Перехід на вкладку Whiteboard оновлює URL', () => {
    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /whiteboard/i }));

    expect(mocks.routerReplace).toHaveBeenCalledWith(
      '/workspaces/ws_123?tab=whiteboard',
      { scroll: false },
    );
  });

  test('13. Перехід на вкладку Documents видаляє параметр tab з URL', () => {
    mocks.activeTab = 'kanban';
    mocks.searchString = 'filter=active&tab=kanban';

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Task board' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /documents/i }));

    expect(mocks.routerReplace).toHaveBeenCalledWith(
      '/workspaces/ws_123?filter=active',
      { scroll: false },
    );
  });

  test('14. Відображення Kanban-дошки з отриманими колонками', () => {
    mocks.activeTab = 'kanban';

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByRole('heading', { name: 'Task board' })).toBeTruthy();
    expect(screen.getByTestId('drag-drop-provider')).toBeTruthy();

    expect(screen.getByTestId('board-column-column_1')).toBeTruthy();
    expect(screen.getByTestId('board-column-column_2')).toBeTruthy();

    expect(screen.getByText('To Do')).toBeTruthy();
    expect(screen.getByText('In Progress')).toBeTruthy();
  });

  test('15. Відображення стану завантаження Kanban-дошки', () => {
    mocks.activeTab = 'kanban';

    vi.mocked(useWorkspaceKanban).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useWorkspaceKanban>);

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText('Loading board structure...')).toBeTruthy();
  });

  test('16. Відображення повідомлення, якщо колонки Kanban ще не створені', () => {
    mocks.activeTab = 'kanban';

    vi.mocked(useWorkspaceKanban).mockReturnValue({
      data: [],
      isLoading: false,
    } as unknown as ReturnType<typeof useWorkspaceKanban>);

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByText(/columns not yet created/i)).toBeTruthy();
  });

  test('17. Відкриття модального вікна створення колонки Kanban', () => {
    mocks.activeTab = 'kanban';

    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /add column/i }));

    expect(mocks.mockOpen).toHaveBeenCalledWith('createTaskColumn');
  });

  test('18. Блокування кнопки Add Column під час завантаження Kanban', () => {
    mocks.activeTab = 'kanban';

    vi.mocked(useWorkspaceKanban).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as ReturnType<typeof useWorkspaceKanban>);

    render(<WorkspacePage />, { wrapper });

    expect(
      (screen.getByRole('button', { name: /add column/i }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  test('19. Відкриття модального вікна створення завдання для відповідної колонки', () => {
    mocks.activeTab = 'kanban';

    render(<WorkspacePage />, { wrapper });

    fireEvent.click(screen.getByRole('button', { name: /add task to to do/i }));

    expect(mocks.mockOpen).toHaveBeenCalledWith('createBoardTask', {
      columnId: 'column_1',
    });
  });

  test('20. Відображення Whiteboard для поточного workspace', () => {
    mocks.activeTab = 'whiteboard';

    render(<WorkspacePage />, { wrapper });

    expect(screen.getByTestId('whiteboard-wrapper')).toBeTruthy();

    expect(screen.getByTestId('whiteboard-wrapper').textContent).toBe('ws_123');
  });
});
