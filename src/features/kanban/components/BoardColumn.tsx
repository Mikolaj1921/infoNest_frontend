'use client';

import React from 'react';
import { TaskCategory } from '@/types/kanban';
import { SortableTaskCard } from './SortableTaskCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { useModal } from '@/hooks/use-modal-store';
import { useDroppable } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';

interface BoardColumnProps {
  column: TaskCategory;
  index: number;
  onAddTask: (columnId: string) => void;
}

export const BoardColumn = ({ column, index, onAddTask }: BoardColumnProps) => {
  const { onOpen } = useModal();
  const tasks = column.boardTasks ?? [];

  // ua: перетягування самої колонки
  const {
    ref: sortableRef,
    isDragging,
    isDropping,
  } = useSortable({
    id: `column:${column.id}`,
    index,
    group: 'columns',
    type: 'column',
    accept: 'column',
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.2, 0, 0, 1)',
      idle: true,
    },
  });

  // ua: зона для перетягування карток завдань у колонку
  const { ref: droppableRef, isDropTarget } = useDroppable({
    id: column.id,
    type: 'column',
    accept: 'task',
  });

  return (
    <div
      ref={sortableRef}
      data-column-id={column.id}
      className={`
        w-72 shrink-0 self-start
        bg-secondary/20 rounded-2xl
        border border-border/40 p-3.5
        flex flex-col max-h-[calc(100vh-220px)]
        text-left
        ${isDragging ? 'opacity-40' : ''}
        ${isDropping ? 'scale-[0.99]' : ''}
      `}
      style={{
        position: 'relative',
        zIndex: isDragging ? 10 : 0,
        willChange: isDragging ? 'transform' : 'auto',
      }}
    >
      <div className="flex items-center justify-between gap-3 pb-2.5 cursor-grab active:cursor-grabbing">
        <div className="flex items-center gap-2 min-w-0">
          <h3
            className="text-xs font-bold text-foreground/90 truncate"
            title={column.name}
          >
            {column.name}
          </h3>

          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground font-bold shrink-0 border border-border/10">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() =>
            onOpen('editTaskColumn', {
              columnId: column.id,
              columnName: column.name,
            })
          }
          className="h-6 w-6 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 flex items-center justify-center transition shrink-0 cursor-pointer"
          title="Options column"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-3 w-3" />
        </button>
      </div>

      <div
        ref={droppableRef}
        className={`
          kanban-droppable
          flex-1 min-h-[50px]
          space-y-2.5 px-0.5 py-1
          rounded-xl
          transition-colors duration-150
        `}
      >
        {tasks.length > 0 ? (
          tasks.map((task, taskIndex) => (
            <SortableTaskCard
              key={task.id}
              task={task}
              index={taskIndex}
              columnId={column.id}
            />
          ))
        ) : (
          <div
            className={`
              text-[11px] italic py-6 text-center
              border border-dashed rounded-xl
              transition-colors duration-150
              ${
                isDropTarget
                  ? 'text-primary/80 border-primary/40 bg-primary/[0.06]'
                  : 'text-muted-foreground/40 border-border/30 bg-background/5'
              }
            `}
          >
            {isDropTarget ? 'Drop task here' : 'No tasks'}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => onAddTask(column.id)}
        className="mt-3 flex items-center justify-center gap-2 w-full py-2 border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 rounded-xl text-[11px] font-bold text-muted-foreground hover:text-primary transition cursor-pointer"
      >
        <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
        <span>Create Task</span>
      </button>
    </div>
  );
};
