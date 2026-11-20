// ai tests - модалка редагування таски

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTaskModal } from './EditTaskModal';
import { useModal } from '@/hooks/use-modal-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useUpdateTask: () => ({ isPending: false, mutate: vi.fn() }),
  useDeleteTask: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('Modal Component: EditTaskModal', () => {
  let queryClient: QueryClient;

  const mockTask = {
    id: 'task-555',
    title: 'Cover forms with tests',
    description: 'Write validation cases for Vitest',
    priority: 'HIGH' as const,
    columnId: 'col-1',
    ownerId: 'user-1',
    position: 0,
    createdAt: '',
    updatedAt: '',
    dueDate: '2026-10-18T00:00:00.000Z',
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. має наповнити всі поля форми (назва, опис, пріоритет) даними обраної таски', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'editBoardTask',
      data: { task: mockTask },
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<EditTaskModal />, { wrapper });

    expect(screen.queryByText('Edit Task')).not.toBeNull();
    expect(screen.queryByText('Task Name')).not.toBeNull();
    expect(screen.queryByText('Description')).not.toBeNull();
    expect(screen.queryByText('Priority')).not.toBeNull();

    const titleInput = screen.getByDisplayValue(
      'Cover forms with tests',
    ) as HTMLInputElement;
    expect(titleInput).not.toBeNull();

    const prioritySelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(prioritySelect.value).toBe('HIGH');
  });

  it('2. має успішно викликати кастомну модалку confirmDeleteTask при натисканні на англійську кнопку Delete', () => {
    const mockOnOpen = vi.fn();
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'editBoardTask',
      data: { task: mockTask },
      onOpen: mockOnOpen,
      onClose: vi.fn(),
    });

    render(<EditTaskModal />, { wrapper });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnOpen).toHaveBeenCalledWith(
      'confirmDeleteTask',
      expect.any(Object),
    );
  });
});
