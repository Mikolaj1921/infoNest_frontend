// ai tests - comp sortable task card

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { SortableTaskCard } from '../SortableTaskCard';
import type { BoardTask } from '@/types/kanban';
import { useSortable } from '@dnd-kit/react/sortable';

// ua: мок sortable-хука dnd-kit
vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: vi.fn(),
}));

// ua: мок дочірньої картки для ізольованого тестування компонента
vi.mock('../TaskCard', () => ({
  TaskCard: ({
    task,
    isDragging,
    isDropping,
  }: {
    task: BoardTask;
    isDragging: boolean;
    isDropping: boolean;
  }) => (
    <div
      data-testid="task-card"
      data-task-title={task.title}
      data-is-dragging={String(isDragging)}
      data-is-dropping={String(isDropping)}
    >
      {task.title}
    </div>
  ),
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

  const sortableRef = React.createRef<HTMLDivElement>();

  beforeEach(() => {
    vi.clearAllMocks();

    // ua: базовий стан sortable-хука
    vi.mocked(useSortable).mockReturnValue({
      ref: sortableRef,
      isDragging: false,
      isDropping: false,
      transition: null,
    } as never);
  });

  it('1. має викликати useSortable з правильним ID та індексом задачі', () => {
    render(<SortableTaskCard task={mockTask} index={3} columnId="col-1" />);

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

  it('2. має передавати правильну конфігурацію transition до useSortable', () => {
    render(<SortableTaskCard task={mockTask} index={0} columnId="col-1" />);

    expect(useSortable).toHaveBeenCalledWith(
      expect.objectContaining({
        transition: {
          duration: 200,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          idle: true,
        },
      }),
    );
  });

  it('3. має відрендерити дочірній TaskCard з назвою задачі', () => {
    render(<SortableTaskCard task={mockTask} index={0} columnId="col-1" />);

    expect(screen.queryByText('Тестувати SortableTaskCard')).not.toBeNull();
  });

  it('4. має передавати TaskCard правильний об’єкт задачі', () => {
    render(<SortableTaskCard task={mockTask} index={0} columnId="col-1" />);

    expect(
      screen.getByTestId('task-card').getAttribute('data-task-title'),
    ).toBe(mockTask.title);
  });

  it('5. має проставити data-task-id на контейнері задачі', () => {
    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    expect(
      container.querySelector('[data-task-id="task-abc-123"]'),
    ).not.toBeNull();
  });

  it('6. має застосувати клас kanban-sortable-task до контейнера', () => {
    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector('[data-task-id="task-abc-123"]');

    expect(wrapper?.classList.contains('kanban-sortable-task')).toBe(true);
  });

  it('7. не має додавати класи перетягування у звичайному стані', () => {
    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector('[data-task-id="task-abc-123"]');

    expect(wrapper?.classList.contains('kanban-task-dragging')).toBe(false);
    expect(wrapper?.classList.contains('kanban-task-dropping')).toBe(false);
  });

  it('8. має застосувати клас kanban-task-dragging під час перетягування', () => {
    vi.mocked(useSortable).mockReturnValue({
      ref: sortableRef,
      isDragging: true,
      isDropping: false,
      transition: null,
    } as never);

    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector('[data-task-id="task-abc-123"]');

    expect(wrapper?.classList.contains('kanban-task-dragging')).toBe(true);
    expect(wrapper?.classList.contains('kanban-task-dropping')).toBe(false);
  });

  it('9. має застосувати клас kanban-task-dropping під час завершення перетягування', () => {
    vi.mocked(useSortable).mockReturnValue({
      ref: sortableRef,
      isDragging: false,
      isDropping: true,
      transition: null,
    } as never);

    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector('[data-task-id="task-abc-123"]');

    expect(wrapper?.classList.contains('kanban-task-dropping')).toBe(true);
    expect(wrapper?.classList.contains('kanban-task-dragging')).toBe(false);
  });

  it('10. має встановлювати правильні стилі під час перетягування', () => {
    vi.mocked(useSortable).mockReturnValue({
      ref: sortableRef,
      isDragging: true,
      isDropping: false,
      transition: null,
    } as never);

    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector(
      '[data-task-id="task-abc-123"]',
    ) as HTMLDivElement | null;

    expect(wrapper?.style.position).toBe('relative');
    expect(wrapper?.style.zIndex).toBe('10');
    expect(wrapper?.style.opacity).toBe('0.35');
    expect(wrapper?.style.willChange).toBe('transform');
  });

  it('11. має встановлювати звичайні стилі, коли задача не перетягується', () => {
    const { container } = render(
      <SortableTaskCard task={mockTask} index={0} columnId="col-1" />,
    );

    const wrapper = container.querySelector(
      '[data-task-id="task-abc-123"]',
    ) as HTMLDivElement | null;

    expect(wrapper?.style.position).toBe('relative');
    expect(wrapper?.style.zIndex).toBe('0');
    expect(wrapper?.style.opacity).toBe('1');
    expect(wrapper?.style.willChange).toBe('auto');
  });

  it('12. має передавати стани dragging та dropping до TaskCard', () => {
    vi.mocked(useSortable).mockReturnValue({
      ref: sortableRef,
      isDragging: true,
      isDropping: true,
      transition: null,
    } as never);

    render(<SortableTaskCard task={mockTask} index={0} columnId="col-1" />);

    const taskCard = screen.getByTestId('task-card');

    expect(taskCard.getAttribute('data-is-dragging')).toBe('true');
    expect(taskCard.getAttribute('data-is-dropping')).toBe('true');
  });
});
