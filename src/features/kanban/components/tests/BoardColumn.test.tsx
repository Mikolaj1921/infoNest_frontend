// ai tests - comp board column

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { BoardColumn } from '../BoardColumn';
import type { TaskCategory } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';

const dndMocks = vi.hoisted(() => ({
  useSortable: vi.fn(),
  useDroppable: vi.fn(),
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: dndMocks.useSortable,
}));

vi.mock('@dnd-kit/react', () => ({
  useDroppable: dndMocks.useDroppable,
}));

// ua: ізолюємо BoardColumn від внутрішньої логіки картки завдання
vi.mock('../SortableTaskCard', () => ({
  SortableTaskCard: ({
    task,
    index,
    columnId,
  }: {
    task: { id: string; title: string };
    index: number;
    columnId: string;
  }) => (
    <div
      data-testid={`sortable-task-${task.id}`}
      data-task-index={index}
      data-column-id={columnId}
    >
      {task.title}
    </div>
  ),
}));

describe('Component: BoardColumn', () => {
  const mockOnOpen = vi.fn();
  const mockOnAddTask = vi.fn();

  const mockSortableRef = vi.fn();
  const mockDroppableRef = vi.fn();

  const mockColumn: TaskCategory = {
    id: 'col-555',
    name: 'В розробці (Спринт 1)',
    workspaceId: 'ws-123',
    position: 0,
    createdAt: '',
    updatedAt: '',
    boardTasks: [
      {
        id: 'task-1',
        title: 'Task 1',
        description: '',
        columnId: 'col-555',
        ownerId: 'user-1',
        priority: 'MEDIUM',
        dueDate: null,
        position: 0,
        createdAt: '',
        updatedAt: '',
      },
    ],
  };

  const renderComponent = (column: TaskCategory = mockColumn, index = 0) => {
    return render(
      <BoardColumn column={column} index={index} onAddTask={mockOnAddTask} />,
    );
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

    dndMocks.useSortable.mockReturnValue({
      ref: mockSortableRef,
      isDragging: false,
      isDropping: false,
    });

    dndMocks.useDroppable.mockReturnValue({
      ref: mockDroppableRef,
      isDropTarget: false,
    });
  });

  it('1. Має відобразити назву колонки та точний лічильник завдань у шапці', () => {
    renderComponent();

    expect(screen.getByText('В розробці (Спринт 1)')).toBeTruthy();

    expect(screen.getByText('1')).toBeTruthy();
  });

  it('2. Має викликати onAddTask при натисканні на Create Task', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('button', { name: /create task/i }));

    expect(mockOnAddTask).toHaveBeenCalledTimes(1);
    expect(mockOnAddTask).toHaveBeenCalledWith('col-555');
  });

  it('3. Має відкрити editTaskColumn з метаданими колонки', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Options column'));

    expect(mockOnOpen).toHaveBeenCalledTimes(1);
    expect(mockOnOpen).toHaveBeenCalledWith('editTaskColumn', {
      columnId: 'col-555',
      columnName: 'В розробці (Спринт 1)',
    });
  });

  it('4. Має відображати картки всіх завдань колонки', () => {
    const column: TaskCategory = {
      ...mockColumn,
      boardTasks: [
        ...mockColumn.boardTasks!,
        {
          id: 'task-2',
          title: 'Task 2',
          description: 'Description 2',
          columnId: 'col-555',
          ownerId: 'user-2',
          priority: 'HIGH',
          dueDate: null,
          position: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    };

    renderComponent(column);

    expect(screen.getByText('Task 1')).toBeTruthy();
    expect(screen.getByText('Task 2')).toBeTruthy();

    expect(screen.getByTestId('sortable-task-task-1')).toBeTruthy();
    expect(screen.getByTestId('sortable-task-task-2')).toBeTruthy();
  });

  it('5. Має передавати правильний індекс кожній картці завдання', () => {
    const column: TaskCategory = {
      ...mockColumn,
      boardTasks: [
        ...mockColumn.boardTasks!,
        {
          id: 'task-2',
          title: 'Task 2',
          description: '',
          columnId: 'col-555',
          ownerId: 'user-1',
          priority: 'LOW',
          dueDate: null,
          position: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    };

    renderComponent(column);

    expect(
      screen
        .getByTestId('sortable-task-task-1')
        .getAttribute('data-task-index'),
    ).toBe('0');

    expect(
      screen
        .getByTestId('sortable-task-task-2')
        .getAttribute('data-task-index'),
    ).toBe('1');
  });

  it('6. Має передавати columnId до кожної картки завдання', () => {
    renderComponent();

    expect(
      screen.getByTestId('sortable-task-task-1').getAttribute('data-column-id'),
    ).toBe('col-555');
  });

  it('7. Має відображати повідомлення No tasks для порожньої колонки', () => {
    const emptyColumn: TaskCategory = {
      ...mockColumn,
      boardTasks: [],
    };

    renderComponent(emptyColumn);

    expect(screen.getByText('No tasks')).toBeTruthy();
    expect(screen.queryByTestId('sortable-task-task-1')).toBeNull();
  });

  it('8. Має відображати лічильник 0 для порожньої колонки', () => {
    const emptyColumn: TaskCategory = {
      ...mockColumn,
      boardTasks: [],
    };

    renderComponent(emptyColumn);

    expect(screen.getByText('0')).toBeTruthy();
  });

  it('9. Має відображати Drop task here, коли порожня колонка є ціллю перетягування', () => {
    dndMocks.useDroppable.mockReturnValue({
      ref: mockDroppableRef,
      isDropTarget: true,
    });

    const emptyColumn: TaskCategory = {
      ...mockColumn,
      boardTasks: [],
    };

    renderComponent(emptyColumn);

    expect(screen.getByText('Drop task here')).toBeTruthy();
    expect(screen.queryByText('No tasks')).toBeNull();
  });

  it('10. Має налаштовувати sortable для колонки з правильними параметрами', () => {
    renderComponent(mockColumn, 2);

    expect(dndMocks.useSortable).toHaveBeenCalledWith({
      id: 'column:col-555',
      index: 2,
      group: 'columns',
      type: 'column',
      accept: 'column',
      transition: {
        duration: 200,
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        idle: true,
      },
    });
  });

  it('11. Має налаштовувати droppable для приймання карток завдань', () => {
    renderComponent();

    expect(dndMocks.useDroppable).toHaveBeenCalledWith({
      id: 'col-555',
      type: 'column',
      accept: 'task',
    });
  });

  it('12. Має застосовувати sortableRef до головного елемента колонки', () => {
    const { container } = renderComponent();

    const columnElement = container.querySelector('[data-column-id="col-555"]');

    expect(columnElement).toBeTruthy();
    expect(columnElement?.getAttribute('data-column-id')).toBe('col-555');
    expect(mockSortableRef).toHaveBeenCalled();
  });

  it('13. Має застосовувати droppableRef до області завдань', () => {
    const { container } = renderComponent();

    const droppableElement = container.querySelector('.kanban-droppable');

    expect(droppableElement).toBeTruthy();
    expect(mockDroppableRef).toHaveBeenCalled();
  });

  it('14. Має змінювати стилі колонки під час перетягування', () => {
    dndMocks.useSortable.mockReturnValue({
      ref: mockSortableRef,
      isDragging: true,
      isDropping: false,
    });

    const { container } = renderComponent();

    const columnElement = container.querySelector('[data-column-id="col-555"]');

    expect(columnElement?.className).toContain('opacity-40');
    expect(columnElement?.getAttribute('style')).toContain('z-index: 10');
    expect(columnElement?.getAttribute('style')).toContain(
      'will-change: transform',
    );
  });

  it('15. Має застосовувати scale під час стану isDropping', () => {
    dndMocks.useSortable.mockReturnValue({
      ref: mockSortableRef,
      isDragging: false,
      isDropping: true,
    });

    const { container } = renderComponent();

    const columnElement = container.querySelector('[data-column-id="col-555"]');

    expect(columnElement?.className).toContain('scale-[0.99]');
  });

  it('16. Має передавати правильну назву колонки в title заголовка', () => {
    renderComponent();

    const heading = screen.getByRole('heading', {
      name: 'В розробці (Спринт 1)',
    });

    expect(heading.getAttribute('title')).toBe('В розробці (Спринт 1)');
  });

  it('17. Має відображати кнопку налаштувань колонки', () => {
    renderComponent();

    expect(screen.getByTitle('Options column')).toBeTruthy();
  });

  it('18. Має відображати кнопку створення завдання навіть для порожньої колонки', () => {
    const emptyColumn: TaskCategory = {
      ...mockColumn,
      boardTasks: [],
    };

    renderComponent(emptyColumn);

    expect(screen.getByRole('button', { name: /create task/i })).toBeTruthy();
  });

  it('19. Має передавати правильний індекс колонки в useSortable', () => {
    renderComponent(mockColumn, 5);

    expect(dndMocks.useSortable).toHaveBeenCalledWith(
      expect.objectContaining({
        index: 5,
      }),
    );
  });
});
