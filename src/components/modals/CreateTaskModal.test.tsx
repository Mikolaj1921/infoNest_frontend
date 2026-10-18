// ai tests - модалка

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateTaskModal } from './CreateTaskModal';
import { useModal } from '@/hooks/use-modal-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useCreateTask: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('Modal Component: CreateTaskModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. має повернути null і не рендерити розмітку, якщо модалка закрита', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<CreateTaskModal />, { wrapper });
    expect(screen.queryByText('Create New Task')).toBeNull();
  });

  it('2. має успішно відобразити поля форми, коли тип модалки дорівнює createBoardTask', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'createBoardTask',
      data: { columnId: 'col-1' },
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<CreateTaskModal />, { wrapper });

    // ua: фікс - пошук за оригінальними англійськими текстами модалки
    expect(screen.queryByText('Create New Task')).not.toBeNull();
    expect(screen.queryByText('Task Name')).not.toBeNull();
    expect(screen.queryByText('Description (optional)')).not.toBeNull();
    expect(screen.queryByText('Priority')).not.toBeNull();
    expect(screen.queryByText('Due Date')).not.toBeNull();

    expect(
      screen.getByPlaceholderText('E.g., Implement role middleware...'),
    ).not.toBeNull();
  });
});
