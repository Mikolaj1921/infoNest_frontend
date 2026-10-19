'use client';

import { useSortable } from '@dnd-kit/react/sortable';
import { TaskCard } from './TaskCard';
import { BoardTask } from '@/types/kanban';

interface SortableTaskCardProps {
  task: BoardTask;
  index: number;
  columnId: string;
}

export const SortableTaskCard = ({
  task,
  index,
  columnId,
}: SortableTaskCardProps) => {
  const {
    ref: sortableRef,
    isDragging,
    isDropping,
  } = useSortable({
    id: task.id,
    index,
    group: columnId,
    type: 'task',
    accept: 'task',
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      idle: true,
    },
  });

  return (
    <div
      ref={sortableRef}
      data-task-id={task.id}
      className={`
        kanban-sortable-task
        ${isDragging ? 'kanban-task-dragging' : ''}
        ${isDropping ? 'kanban-task-dropping' : ''}
      `}
      style={{
        position: 'relative',
        zIndex: isDragging ? 10 : 0,
        opacity: isDragging ? 0.35 : 1,
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      <TaskCard task={task} isDragging={isDragging} isDropping={isDropping} />
    </div>
  );
};
