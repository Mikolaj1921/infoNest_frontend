// test file for CreateFolderModal component - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateFolderModal } from './CreateFolderModal';
import { useModal } from '@/hooks/use-modal-store';
import { useCreateCategory } from '@/features/documents/hooks/use-category-mutations';
import React from 'react';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/features/documents/hooks/use-category-mutations', () => ({
  useCreateCategory: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

describe('CreateFolderModal Component', () => {
  const mockClose = vi.fn();
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'createCategory',
      data: {},
      onOpen: vi.fn(),
      onClose: mockClose,
    });

    vi.mocked(useCreateCategory).mockReturnValue({
      mutateAsync: mockMutateAsync,
      isPending: false,
      // eslint-disable-next-line
    } as any);
  });

  it('має рендерити модалку з усіма необхідними текстовими елементами', () => {
    render(<CreateFolderModal />);

    expect(
      screen.getByRole('heading', { name: 'Create New Category' }),
    ).toBeTruthy();
    expect(
      screen.getByPlaceholderText('For example: Marketing, Sprint 5...'),
    ).toBeTruthy();
  });

  it('має показувати помилку валідації Zod, якщо поле назви відправлено порожнім', async () => {
    render(<CreateFolderModal />);

    const submitButton = screen.getByRole('button', { name: /^Create$/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/character|required|обов|порожн/i)).toBeTruthy();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('має успішно викликати мутацію та закривати вікно, якщо форма валідна', async () => {
    render(<CreateFolderModal />);

    const input = screen.getByPlaceholderText(
      'For example: Marketing, Sprint 5...',
    );
    const submitButton = screen.getByRole('button', { name: /^Create$/i });

    fireEvent.change(input, { target: { value: 'Аналітика 2026' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({ name: 'Аналітика 2026' });
    });

    expect(mockClose).toHaveBeenCalled();
  });
});
