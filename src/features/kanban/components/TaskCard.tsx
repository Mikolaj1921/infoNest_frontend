'use client';

import React from 'react';
import { BoardTask, TaskPriority } from '@/types/kanban';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faCircle } from '@fortawesome/free-solid-svg-icons';

interface TaskCardProps {
  task: BoardTask;
}

// ua: підбір кольору бейджа для різних рівнів пріоритету задачі
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

export const TaskCard = ({ task }: TaskCardProps) => {
  const priority = getPriorityStyles(task.priority);

  return (
    <div className="group relative flex flex-col rounded-xl border border-border/50 bg-background/60 p-3.5 space-y-3 hover:border-primary/30 hover:bg-accent/10 transition-all duration-200 cursor-pointer shadow-sm animate-in fade-in duration-200 select-none">
      {/* Заголовок та пріоритет таски */}
      <div className="space-y-1.5 text-left">
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

      {/* Опис задачі (якщо є) */}
      {task.description && (
        <p className="text-[11px] text-muted-foreground/70 text-left line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Нижня панель метаданих: дедлайн та виконавець */}
      <div className="flex items-center justify-between pt-1 border-t border-border/20 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <FontAwesomeIcon icon={faClock} className="h-3 w-3 opacity-60" />
          <span>
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString('uk-UA')
              : 'Without deadline'}
          </span>
        </div>

        {/* Компактний аватар виконавця */}
        <div className="h-5 w-5 rounded-full bg-secondary/80 border border-border/50 flex items-center justify-center font-bold text-[9px] text-foreground/80 shrink-0">
          U
        </div>
      </div>
    </div>
  );
};
