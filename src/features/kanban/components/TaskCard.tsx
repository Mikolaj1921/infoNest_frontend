// task card - ua: модалка картки таски

'use client';

import React from 'react';
import { BoardTask, TaskPriority } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCircle } from '@fortawesome/free-solid-svg-icons';

interface TaskCardProps {
  task: BoardTask;
  isDragging?: boolean;
  isDropping?: boolean;
}

const getPriorityStyles = (priority: TaskPriority) => {
  switch (priority) {
    case 'HIGH':
      return {
        bg: 'bg-destructive/10 border-destructive/20 text-destructive',
        label: 'High',
      };
    case 'LOW':
      return {
        bg: 'bg-green-500/10 border-green-500/20 text-green-500',
        label: 'Low',
      };
    default:
      return {
        bg: 'bg-primary/10 border-primary/20 text-primary',
        label: 'Medium',
      };
  }
};

export const TaskCard = ({
  task,
  isDragging = false,
  isDropping = false,
}: TaskCardProps) => {
  const { onOpen } = useModal();
  const priority = getPriorityStyles(task.priority);

  const handleClick = () => {
    if (isDragging || isDropping) return;

    onOpen('editBoardTask', { task });
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex flex-col
        rounded-xl border bg-background/60
        p-3.5 space-y-3
        select-none text-left
        transition-[border-color,background-color,box-shadow]
        duration-150
        ${
          isDragging
            ? 'border-primary/50 shadow-xl shadow-black/15 ring-1 ring-primary/20 cursor-grabbing'
            : 'border-border/50 hover:border-primary/30 hover:bg-accent/10 cursor-pointer shadow-sm'
        }
      `}
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold ${priority.bg}`}
          >
            <FontAwesomeIcon icon={faCircle} className="h-1.5 w-1.5 shrink-0" />
            <span>{priority.label}</span>
          </span>
        </div>

        <h4 className="text-xs font-bold text-foreground/90 leading-normal group-hover:text-primary transition-colors">
          {task.title}
        </h4>
      </div>

      {task.description && (
        <p
          className="task-card-description text-[11px] text-muted-foreground/70 leading-relaxed"
          title={task.description}
        >
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3 opacity-60" />
          <span>
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('uk-UA')
              : 'No due date'}
          </span>
        </div>

        <div className="h-5 w-5 rounded-full bg-secondary/80 border border-border/50 flex items-center justify-center font-bold text-[9px] text-foreground/80 shrink-0">
          U
        </div>
      </div>
    </div>
  );
};
