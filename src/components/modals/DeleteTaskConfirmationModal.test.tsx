// ai tests - модалка видалення таски

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteTaskConfirmationModal } from './DeleteTaskConfirmationModal';
import { useModal } from '@/hooks/use-modal-store';

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

describe('Modal Component: DeleteTaskConfirmationModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. має динамічно вивести на екран confirmTitle та confirmDescription', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'confirmDeleteTask',
      data: {
        confirmTitle: 'Остаточно видалити стовпець?',
        confirmDescription: 'Усі картки всередині будуть стерті.',
        onConfirm: mockOnConfirm,
      },
      onOpen: vi.fn(),
      onClose: mockOnClose,
    });

    render(<DeleteTaskConfirmationModal />);

    expect(screen.queryByText('Остаточно видалити стовпець?')).not.toBeNull();
    expect(
      screen.queryByText('Усі картки всередині будуть стерті.'),
    ).not.toBeNull();
  });

  it('2. має запустити функцію onConfirm при натисканні на англомовну кнопку Delete', async () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'confirmDeleteTask',
      data: {
        confirmTitle: 'Delete?',
        confirmDescription: 'Sure?',
        onConfirm: mockOnConfirm,
      },
      onOpen: vi.fn(),
      onClose: mockOnClose,
    });

    render(<DeleteTaskConfirmationModal />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnConfirm).toHaveBeenCalled();
  });
});
