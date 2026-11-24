// ai tests - comp task card

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { TaskCard } from '../TaskCard';
import type { BoardTask } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';

// ua: мок модального контексту
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

// ua: мок Font Awesome для ізольованого тестування компонента
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <svg data-testid="font-awesome-icon" />,
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

  it('1. має відобразити заголовок, опис та локалізовану дату дедлайну', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByText(mockTask.title)).not.toBeNull();

    if (mockTask.description) {
      expect(screen.queryByText(mockTask.description)).not.toBeNull();
    }

    expect(screen.queryByText('25.12.2026')).not.toBeNull();
  });

  it('2. має правильно відображати високий пріоритет High', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByText('High')).not.toBeNull();
  });

  it('3. має правильно відображати низький пріоритет Low', () => {
    const task = { ...mockTask, priority: 'LOW' as const };

    render(<TaskCard task={task} />);

    expect(screen.queryByText('Low')).not.toBeNull();
  });

  it('4. має правильно відображати середній пріоритет Medium', () => {
    const task = { ...mockTask, priority: 'MEDIUM' as const };

    render(<TaskCard task={task} />);

    expect(screen.queryByText('Medium')).not.toBeNull();
  });

  it('5. має відображати No due date, якщо дата дедлайну порожня', () => {
    const task = { ...mockTask, dueDate: '' };

    render(<TaskCard task={task} />);

    expect(screen.queryByText('No due date')).not.toBeNull();
  });

  it('6. має відображати No due date, якщо дата дедлайну дорівнює null', () => {
    const task = { ...mockTask, dueDate: null };

    render(<TaskCard task={task} />);

    expect(screen.queryByText('No due date')).not.toBeNull();
  });

  it('7. не має відображати опис, якщо він відсутній', () => {
    const task = { ...mockTask, description: '' };

    render(<TaskCard task={task} />);

    expect(document.querySelector('.task-card-description')).toBeNull();
  });

  it('8. має встановлювати повний опис у title атрибуті', () => {
    render(<TaskCard task={mockTask} />);

    const description = document.querySelector('.task-card-description');

    expect(description?.getAttribute('title')).toBe(mockTask.description);
  });

  it('9. має відображати кількість прикріплених документів', () => {
    const task = {
      ...mockTask,
      documents: [{ id: 'doc-1' }, { id: 'doc-2' }],
    } as BoardTask;

    render(<TaskCard task={task} />);

    expect(screen.queryByText('2')).not.toBeNull();
  });

  it('10. не має відображати блок документів, якщо їх немає', () => {
    const task = { ...mockTask, documents: [] };

    render(<TaskCard task={task} />);

    expect(
      document.querySelector('[title="Attached documents: 0"]'),
    ).toBeNull();
  });

  it('11. має відображати аватар із початковою літерою U', () => {
    render(<TaskCard task={mockTask} />);

    expect(screen.queryByText('U')).not.toBeNull();
  });

  it('12. має відкривати модалку editBoardTask з об’єктом задачі при кліку', () => {
    render(<TaskCard task={mockTask} />);

    fireEvent.click(screen.getByText(mockTask.title));

    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnOpen).toHaveBeenCalledWith('editBoardTask', {
      task: mockTask,
    });
  });

  it('13. не має відкривати модалку, якщо задача перетягується', () => {
    render(<TaskCard task={mockTask} isDragging />);

    fireEvent.click(screen.getByText(mockTask.title));

    expect(mockOnOpen).not.toHaveBeenCalled();
  });

  it('14. не має відкривати модалку, якщо задача перебуває у стані dropping', () => {
    render(<TaskCard task={mockTask} isDropping />);

    fireEvent.click(screen.getByText(mockTask.title));

    expect(mockOnOpen).not.toHaveBeenCalled();
  });

  it('15. має відкривати модалку, якщо задача не перетягується і не перебуває у стані dropping', () => {
    render(<TaskCard task={mockTask} isDragging={false} isDropping={false} />);

    fireEvent.click(screen.getByText(mockTask.title));

    expect(mockOnOpen).toHaveBeenCalledWith('editBoardTask', {
      task: mockTask,
    });
  });
});
