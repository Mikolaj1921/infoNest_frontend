// ua: тест компонента елемента(таски) в таблиці канбан

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';
import { BoardTask } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';

// ai tests

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

describe('Component: TaskCard', () => {
  const mockOnOpen = vi.fn();

  const mockTask: BoardTask = {
    id: 'task-777',
    title: 'Реалізувати кастомний календар',
    description: 'Оновити інпути дати через рефи та метод showPicker',
    columnId: 'col-1',
    ownerId: 'user-99',
    priority: 'HIGH',
    dueDate: '2026-12-25T00:00:00.000Z',
    position: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useModal).mockReturnValue({
      type: null,
      data: {},
      isOpen: false,
      onOpen: mockOnOpen,
      onClose: vi.fn(),
    });
  });

  it('1. має успішно відобразити заголовок, опис та локалізовану дату дедлайну', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByText('Реалізувати кастомний календар')).not.toBeNull();
    expect(
      screen.queryByText('Оновити інпути дати через рефи та метод showPicker'),
    ).not.toBeNull();
    expect(screen.queryByText('25.12.2026')).not.toBeNull();
  });

  it('2. має правильно підставити текст «High» для високого пріоритету', () => {
    render(<TaskCard task={mockTask} />);
    expect(screen.queryByText('High')).not.toBeNull();
  });

  it('3. має написати «No due date», якщо дата дедлайну дорівнює порожньому рядку або null', () => {
    const taskWithoutDate = { ...mockTask, dueDate: '' };
    render(<TaskCard task={taskWithoutDate} />);

    expect(screen.queryByText('No due date')).not.toBeNull();
  });

  it('4. має викликати модалку editBoardTask з об’єктом задачі при кліку на картку', () => {
    render(<TaskCard task={mockTask} />);

    const cardContainer = screen
      .getByText('Реалізувати кастомний календар')
      .closest('div');
    if (cardContainer) {
      fireEvent.click(cardContainer);
    }

    expect(mockOnOpen).toHaveBeenCalledWith('editBoardTask', {
      task: mockTask,
    });
  });
});
