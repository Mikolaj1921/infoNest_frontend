'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/use-modal-store';
import { useUpdateTask } from '@/hooks/useKanbanData'; // ua: імпортуємо хук оновлення
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';

// ua: сувора схема валідації полів із обов'язковим enum
const editTaskSchema = z.object({
  title: z.string().min(1, 'Назва завдання є обов’язковою').max(200),
  description: z.string().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

// fix ua: заюзано типи для форми вводу та виводу, щоб забезпечити правильне виведення типів з реакт хук форм + зод
type EditTaskFormInput = z.input<typeof editTaskSchema>;
type EditTaskFormValues = z.output<typeof editTaskSchema>;

export const EditTaskModal = () => {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, data, onClose } = useModal();
  const isModalOpen = isOpen && type === 'editBoardTask';
  const { task } = data; // ua: витягуємо поточну таску для редагування

  const updateTaskMutation = useUpdateTask(workspaceId);

  // ua: хендлер для сабміту форми редагування задачі (fix: поправлено типізацію)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditTaskFormInput, undefined, EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
    },
  });

  // ua: динамічно скидаємо та наповнюємо поля форми, коли користувач відкриває іншу таску
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
      });
    }
  }, [task, reset]);

  const onSubmit: SubmitHandler<EditTaskFormValues> = async (values) => {
    if (!task) return;

    updateTaskMutation.mutate(
      {
        taskId: task.id,
        payload: {
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  if (!isModalOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* шапка модалки */}
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Edit Task</h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* форма редагування */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Task Name
            </label>
            <input
              {...register('title')}
              type="text"
              disabled={updateTaskMutation.isPending}
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
              Description
            </label>
            <textarea
              {...register('description')}
              disabled={updateTaskMutation.isPending}
              rows={3}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Priority
            </label>
            <select
              {...register('priority')}
              disabled={updateTaskMutation.isPending}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* дії - кнопки */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={updateTaskMutation.isPending}
              className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTaskMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {updateTaskMutation.isPending && (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-3 w-3 animate-spin"
                />
              )}
              <span>Saved changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
