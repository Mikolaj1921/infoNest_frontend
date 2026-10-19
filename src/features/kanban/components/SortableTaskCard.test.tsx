// ai tests

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableTaskCard } from './SortableTaskCard';
import { BoardTask } from '@/types/kanban';
import { useSortable } from '@dnd-kit/react/sortable';

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: vi.fn(),
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(() => ({
    onOpen: vi.fn(),
  })),
}));

describe('Component: SortableTaskCard', () => {
  const mockTask: BoardTask = {
    id: 'task-abc-123',
    title: 'Тестувати SortableTaskCard',
    description: 'Написати чистий тест-кейс для нового dnd-kit компонента',
    columnId: 'col-1',
    ownerId: 'user-1',
    priority: 'LOW',
    dueDate: null,
    position: 0,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // ua: імітуємо повернення базових dnd параметрів відuseSortable
    vi.mocked(useSortable).mockReturnValue({
      ref: React.createRef<HTMLDivElement>(),
      isDragging: false,
      isDropping: false,
      transition: null,
      // eslint-disable-next-line
    } as any);
  });

  it('1. має успішно викликатиuseSortable з правильним ID та індексом задачі', () => {
    render(<SortableTaskCard task={mockTask} index={3} columnId="col-1" />);

    // ua: перевіряємо, що dnd-kit отримав суворі координати для побудови віртуального дерева перетягування
    expect(useSortable).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'task-abc-123',
        index: 3,
        group: 'col-1',
        type: 'task',
        accept: 'task',
      }),
    );
  });

  it('2. має успішно відрендерити дочірній компонент TaskCard з назвою завдання всередині', () => {
    render(<SortableTaskCard task={mockTask} index={0} columnId="col-1" />);

    // ua: перевіряємо, що розмітка картки успішно змонтувалася під обгорткою sortableRef
    expect(screen.queryByText('Тестувати SortableTaskCard')).not.toBeNull();
    expect(screen.queryByText('Low')).not.toBeNull();
    expect(screen.queryByText('No due date')).not.toBeNull();
  });

  it('3. має проставити правильний сервісний дата-атрибут data-task-id на контейнер', () => {
    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    // ua: перевіряємо наявність атрибуту для пошуку елементів у dnd операціях
    const wrapperDiv = container.querySelector('[data-task-id="task-abc-123"]');
    expect(wrapperDiv).not.toBeNull();
  });
});
