// test file for CreateFolderModal component - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDocumentModal } from './CreateDocumentModal';
import { useModal } from '@/hooks/use-modal-store';
import { useCreateDocument } from '@/features/documents/hooks/use-document-mutations';
import React from 'react';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/features/documents/hooks/use-document-mutations', () => ({
  useCreateDocument: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

describe('CreateDocumentModal Component', () => {
  const mockClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'createDocument',
      data: { categoryId: 'cat-999', categoryName: 'Робоча папка' },
      onOpen: vi.fn(),
      onClose: mockClose,
    });

    vi.mocked(useCreateDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      // eslint-disable-next-line
    } as any);
  });

  it('має показувати контекстний опис із назвою батьківської папки', () => {
    render(<CreateDocumentModal />);

    expect(screen.getByText('Create Document in')).toBeTruthy();
    expect(screen.getByText('Робоча папка')).toBeTruthy();
  });

  it('має блокувати кнопку відправки та показувати стан завантаження, коли запит обробляється', () => {
    vi.mocked(useCreateDocument).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: true,
      // eslint-disable-next-line
    } as any);

    render(<CreateDocumentModal />);

    const submitButton = screen.getByRole('button', {
      name: 'Creating...',
    }) as HTMLButtonElement;

    expect(submitButton).toBeTruthy();
    expect(submitButton.disabled).toBe(true);
  });

  it('має успішно викликати створення документа при валідній назві', async () => {
    render(<CreateDocumentModal />);

    const input = screen.getByPlaceholderText(
      'Наприклад: ТЗ Спринт 6, Нотатки з мітингу...',
    );
    const submitButton = screen.getByRole('button', { name: /^Create$/i });

    fireEvent.change(input, { target: { value: 'План розробки' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        categoryId: 'cat-999',
        title: 'План розробки',
      });
    });

    expect(mockClose).toHaveBeenCalled();
  });
});
