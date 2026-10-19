// ua: тест компонента колонки в таблиці канбан

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BoardColumn } from './BoardColumn';
import { TaskCategory } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ai tests

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useDeleteColumn: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('Component: BoardColumn', () => {
  let queryClient: QueryClient;
  const mockOnOpen = vi.fn();
  const mockOnAddTask = vi.fn();

  const mockColumn: TaskCategory = {
    id: 'col-555',
    name: 'В розробці (Спринт 1)',
    workspaceId: 'ws-123',
    position: 0,
    createdAt: '',
    updatedAt: '',
    boardTasks: [
      {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'col-555',
        ownerId: 'user-1',
        priority: 'MEDIUM',
        dueDate: null,
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
    ],
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();

    vi.mocked(useModal).mockReturnValue({
      type: null,
      data: {},
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: vi.fn(),
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. має відобразити назву колонки та точний лічильник завдань у шапці', () => {
    render(<BoardColumn column={mockColumn} onAddTask={mockOnAddTask} />, {
      wrapper,
    });

    expect(screen.queryByText('В розробці (Спринт 1)')).not.toBeNull();
    expect(screen.queryByText('1')).not.toBeNull(); // лічильник
  });

  it('2. має викликати колбек onAddTask при натисканні на нижню кнопку Create Task', () => {
    render(<BoardColumn column={mockColumn} onAddTask={mockOnAddTask} />, {
      wrapper,
    });

    const addTaskButton = screen.getByRole('button', { name: /create task/i });
    fireEvent.click(addTaskButton);

    expect(mockOnAddTask).toHaveBeenCalledWith('col-555');
  });

  it('3. має відкрити модалку editTaskColumn з метаданими при кліку на трикрапки (налаштування)', () => {
    render(<BoardColumn column={mockColumn} onAddTask={mockOnAddTask} />, {
      wrapper,
    });

    const optionsButton = screen.getByTitle('Options column');
    fireEvent.click(optionsButton);

    expect(mockOnOpen).toHaveBeenCalledWith('editTaskColumn', {
      columnId: 'col-555',
      columnName: 'В розробці (Спринт 1)',
    });
  });
});
