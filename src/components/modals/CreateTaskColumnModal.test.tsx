// ai tests - модалка створення колонки

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CreateTaskColumnModal } from './CreateTaskColumnModal';
import { useModal } from '@/hooks/use-modal-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useCreateColumn: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('Modal Component: CreateTaskColumnModal', () => {
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

    render(<CreateTaskColumnModal />, { wrapper });
    expect(screen.queryByText('Create New Column')).toBeNull();
  });

  it('2. має успішно відобразити інпут назви стовпця при відкритті', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'createTaskColumn',
      data: {},
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<CreateTaskColumnModal />, { wrapper });

    // ua: фікс - за точними надписами
    expect(screen.queryByText('Create New Column')).not.toBeNull();
    expect(screen.queryByText('Name of the new column')).not.toBeNull();
    expect(screen.queryByText('Cancel')).not.toBeNull();

    expect(
      screen.getByPlaceholderText('E.g., In Progress, Testing...'),
    ).not.toBeNull();
  });
});
