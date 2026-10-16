'use client';

import React from 'react';
import { TaskCategory } from '@/types/kanban';
import { TaskCard } from './TaskCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

interface BoardColumnProps {
  column: TaskCategory;
  onAddTask: (columnId: string) => void;
}

export const BoardColumn = ({ column, onAddTask }: BoardColumnProps) => {
  return (
    <div className="w-72 shrink-0 bg-secondary/20 rounded-2xl border border-border/40 p-3.5 flex flex-col max-h-[calc(100vh-220px)] animate-in fade-in duration-300 text-left">
      {/* Шапка колонки: назва, лічильник та опції */}
      <div className="flex items-center justify-between gap-3 pb-2.5 mb-3 border-b border-border/30">
        <div className="flex items-center gap-2 min-w-0">
          <h3
            className="text-xs font-bold text-foreground/90 truncate"
            title={column.name}
          >
            {column.name}
          </h3>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] text-muted-foreground font-bold shrink-0 border border-border/10">
            {column.boardTasks?.length || 0}
          </span>
        </div>

        {/* ua: Кнопка опцій колонки (майбутній виклик перейменування/видалення стовпця) */}
        <button
          type="button"
          className="h-6 w-6 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/40 flex items-center justify-center transition shrink-0 cursor-pointer"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-3 w-3" />
        </button>
      </div>

      {/* Вертикальна стрічка карток задач */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin scrollbar-thumb-border/40">
        {column.boardTasks && column.boardTasks.length > 0 ? (
          column.boardTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))
        ) : (
          <div className="text-[11px] text-muted-foreground/40 italic py-6 text-center border border-dashed border-border/30 rounded-xl bg-background/5">
            No tasks
          </div>
        )}
      </div>

      {/* Нижня кнопка швидкого створення таски в цій колонці */}
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
