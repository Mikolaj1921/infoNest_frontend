// ua: мокалка для створення нової задачі в канбан-дошці

'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/use-modal-store';
import { useCreateTask } from '@/hooks/useKanbanData';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';

// ua: клієнтська схема валідації полів через бібліотеку zod
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
});

// fix: used types for form input and output to ensure proper type inference with react-hook-form and zod
type TaskFormInput = z.input<typeof taskSchema>;
type TaskFormValues = z.output<typeof taskSchema>;

export const CreateTaskModal = () => {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, data, onClose } = useModal();
  const isModalOpen = isOpen && type === 'createBoardTask';
  const { columnId } = data;

  const createTaskMutation = useCreateTask(workspaceId);

  // ua: хендлер для сабміту форми створення задачі
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    // any -> underfined
  } = useForm<TaskFormInput, undefined, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  const onSubmit = async (values: TaskFormValues) => {
    if (!columnId) return;

    // ua: фул набір метаданих на серв для створення нової задачі
    createTaskMutation.mutate(
      {
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        columnId,
        workspaceId,
      },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      },
    );
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Create New Task
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 flex items-center justify-center transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* Форма створення */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Task Name
            </label>
            <input
              {...register('title')}
              type="text"
              disabled={createTaskMutation.isPending}
              placeholder="E.g., Implement role middleware..."
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition"
            />
            {errors.title && (
              <p className="text-[10px] font-semibold text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              disabled={createTaskMutation.isPending}
              placeholder="Add task details here..."
              rows={3}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition resize-none"
            />
          </div>

          {/* апдейт: кастомний селект для вибору рівня пріоритету завдання */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Priority
            </label>
            <select
              {...register('priority')}
              disabled={createTaskMutation.isPending}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition cursor-pointer text-foreground/90"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Кнопки дій */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createTaskMutation.isPending}
              className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {createTaskMutation.isPending && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-3 w-3 animate-spin"
                />
              )}
              <span>Create</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
