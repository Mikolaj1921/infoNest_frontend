// ai tests - del doc modal

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteDocumentConfirmModal } from './DeleteDocumentConfirmModal';
import { useModal } from '@/hooks/use-modal-store';
import { useDeleteDocument } from '@/features/documents/hooks/use-document-mutations';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/features/documents/hooks/use-document-mutations', () => ({
  useDeleteDocument: vi.fn(),
}));

describe('Modal Component: DeleteDocumentConfirmModal', () => {
  let queryClient: QueryClient;
  const mockDeleteDocument = vi.fn().mockResolvedValue({});

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();

    vi.mocked(useDeleteDocument).mockReturnValue({
      isPending: false,
      mutateAsync: mockDeleteDocument,
      // eslint-disable-next-line
    } as any);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. має повернути null, якщо модалка документа закрита', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: vi.fn(),
      onClose: vi.fn(),
    });

    render(<DeleteDocumentConfirmModal />, { wrapper });
    expect(screen.queryByText('Delete Document?')).toBeNull();
  });

  it('2. має успішно викликати мутацію видалення документа з правильним ID при підтвердженні', async () => {
    const mockOnClose = vi.fn();
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'deleteDocument',
      data: { documentId: 'doc-888', documentTitle: 'Інструкція API' },
      onOpen: vi.fn(),
      onClose: mockOnClose,
    });

    render(<DeleteDocumentConfirmModal />, { wrapper });

    expect(screen.queryByText('Delete Document?')).not.toBeNull();
    expect(screen.queryByText('Attention:')).not.toBeNull();

    const confirmButton = screen.getByRole('button', {
      name: /delete permanently/i,
    });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(mockDeleteDocument).toHaveBeenCalledWith('doc-888');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
