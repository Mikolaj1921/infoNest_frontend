// ai tests - del category modal

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteCategoryConfirmModal } from './DeleteCategoryConfirmModal';
import { useModal } from '@/hooks/use-modal-store';
import { useDeleteCategory } from '@/features/documents/hooks/use-category-mutations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/features/documents/hooks/use-category-mutations', () => ({
  useDeleteCategory: vi.fn(),
}));

describe('Modal Component: DeleteCategoryConfirmModal', () => {
  let queryClient: QueryClient;
  const mockDeleteCategory = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    vi.mocked(useDeleteCategory).mockReturnValue({
      isPending: false,
      mutateAsync: mockDeleteCategory,
      // eslint-disable-next-line
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. має повернути null і не додавати розмітку в DOM, якщо тип модалки закритий', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<DeleteCategoryConfirmModal />, { wrapper });
    expect(screen.queryByText('Delete Category?')).toBeNull();
  });

  it('2. має успішно відобразити назву папки в попередженні та викликати мутацію видалення по кліку', async () => {
    const mockOnClose = vi.fn();
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'deleteCategory',
      data: { categoryId: 'cat-777', categoryName: 'Чернетки Фіч' },
      onOpen: vi.fn(),
      onClose: mockOnClose,
    });

    render(<DeleteCategoryConfirmModal />, { wrapper });

    expect(screen.queryByText('Delete Category?')).not.toBeNull();
    expect(screen.queryByText('Critical Warning:')).not.toBeNull();
    expect(screen.queryByText(/"Чернетки Фіч"/i)).not.toBeNull();

    const confirmButton = screen.getByRole('button', {
      name: /delete permanently/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteCategory).toHaveBeenCalledWith('cat-777');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
