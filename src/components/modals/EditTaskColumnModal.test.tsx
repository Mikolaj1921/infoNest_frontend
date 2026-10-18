// ai tests - модалка редагування колонки

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EditTaskColumnModal } from './EditTaskColumnModal';
import { useModal } from '@/hooks/use-modal-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useUpdateColumn: () => ({ isPending: false, mutate: vi.fn() }),
  useDeleteColumn: () => ({ isPending: false, mutate: vi.fn() }),
}));

describe('Modal Component: EditTaskColumnModal', () => {
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

  it('1. має успішно підставити поточну назву колонки в поле вводу', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'editTaskColumn',
      data: { columnId: 'col-999', columnName: 'Ready for Release' },
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<EditTaskColumnModal />, { wrapper });

    expect(screen.queryByText('Edit Column')).not.toBeNull();
    const input = screen.getByDisplayValue(
      'Ready for Release',
    ) as HTMLInputElement;
    expect(input).not.toBeNull();
  });

  it('2. має викликати кастомне вікно підтвердження confirmDeleteTask по кліку на англійську кнопку Delete', () => {
    const mockOnOpen = vi.fn();
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'editTaskColumn',
      data: { columnId: 'col-999', columnName: 'Ready for Release' },
      onOpen: mockOnOpen,
      onClose: vi.fn(),
    });

    render(<EditTaskColumnModal />, { wrapper });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnOpen).toHaveBeenCalledWith(
      'confirmDeleteTask',
      expect.any(Object),
    );
  });
});
