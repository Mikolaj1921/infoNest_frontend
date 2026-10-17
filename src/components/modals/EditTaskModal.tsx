'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/use-modal-store';
import { useUpdateTask, useDeleteTask } from '@/hooks/useKanbanData'; // ua: хуки оновлення та видалення
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faSpinner,
  faTrashCan,
  faCalendarDays,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

const editTaskSchema = z.object({
  title: z.string().min(1, 'Task name is required').max(200),
  description: z.string().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().default(''),
});

// fix ua: заюзано типи для форми вводу та виводу, щоб забезпечити правильне виведення типів з реакт хук форм + зод
type EditTaskFormInput = z.input<typeof editTaskSchema>;
type EditTaskFormValues = z.output<typeof editTaskSchema>;

export const EditTaskModal = () => {
  const params = useParams();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, data, onClose, onOpen } = useModal();
  const isModalOpen = isOpen && type === 'editBoardTask';
  const { task } = data; // ua: витягуємо поточну таску для редагування

  const updateTaskMutation = useUpdateTask(workspaceId);
  const deleteTaskMutation = useDeleteTask(workspaceId);

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

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
      dueDate: '',
    },
  });

  // ua: хендлер для динамічного ресайзу textarea опису задачі
  const resizeDescription = useCallback(() => {
    const textarea = descriptionRef.current;

    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  // ua: динамічно скидаємо та наповнюємо поля форми, коли користувач відкриває іншу таску
  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [task, reset]);

  // ua: динамічний ресайз textarea при відкритті модалки та зміні таски
  useEffect(() => {
    if (!isModalOpen || !task) return;

    const frame = requestAnimationFrame(resizeDescription);

    return () => cancelAnimationFrame(frame);
  }, [isModalOpen, task, resizeDescription]);

  // ua: хендлер для сабміту форми
  const onSubmit: SubmitHandler<EditTaskFormValues> = async (values) => {
    if (!task) return;

    updateTaskMutation.mutate(
      {
        taskId: task.id,
        payload: {
          title: values.title.trim(),
          description: values.description.trim(),
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : '',
        },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  // ua: хендлер для видалення таски з підтвердженням
  const handleDelete = () => {
    if (!task) return;

    onOpen('confirmDeleteTask', {
      confirmTitle: 'Delete Task?',
      confirmDescription: `Are you sure you want to delete the task "${task.title}"?`,
      onConfirm: async () => {
        return new Promise<void>((resolve, reject) => {
          deleteTaskMutation.mutate(task.id, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });
      },
    });
  };

  const handleIconClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
        // eslint-disable-next-line
      } catch (error) {
        dateInputRef.current.click();
      }
    }
  };

  if (!isModalOpen || !task) return null;

  const { ref: registerDateRef, ...registerDateProps } = register('dueDate');

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
              disabled={
                updateTaskMutation.isPending || deleteTaskMutation.isPending
              }
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
              ref={(element) => {
                register('description').ref(element);
                descriptionRef.current = element;
              }}
              disabled={
                updateTaskMutation.isPending || deleteTaskMutation.isPending
              }
              rows={3}
              onInput={resizeDescription}
              className="w-full min-h-[90px] rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs leading-relaxed focus:border-primary/40 focus:outline-hidden transition resize-none overflow-hidden"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Priority
            </label>

            <div className="relative">
              <select
                {...register('priority')}
                disabled={
                  updateTaskMutation.isPending || deleteTaskMutation.isPending
                }
                className="w-full appearance-none rounded-xl border border-border/60 bg-background/50 pl-3.5 pr-10 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition cursor-pointer"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <FontAwesomeIcon
                icon={faChevronDown}
                className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-foreground/60"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Due Date
            </label>
            <div className="relative w-full flex items-center">
              <input
                type="date"
                disabled={
                  updateTaskMutation.isPending || deleteTaskMutation.isPending
                }
                {...registerDateProps}
                ref={(e) => {
                  registerDateRef(e);

                  dateInputRef.current = e;
                }}
                className="w-full rounded-xl border border-border/60 bg-background/50 pl-3.5 pr-10 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition text-foreground [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:w-0 [&::-webkit-calendar-picker-indicator]:h-0"
              />
              <button
                type="button"
                onClick={handleIconClick}
                disabled={
                  updateTaskMutation.isPending || deleteTaskMutation.isPending
                }
                className="absolute right-3.5 text-muted-foreground/60 hover:text-primary transition cursor-pointer flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faCalendarDays}
                  className="h-3.5 w-3.5"
                />
              </button>
            </div>
          </div>

          {/* ua: дії - кнопки */}
          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/20">
            {/* button to delete task */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                updateTaskMutation.isPending || deleteTaskMutation.isPending
              }
              className="h-9 px-3 rounded-xl border border-destructive/30 hover:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              title="Delete task"
            >
              {deleteTaskMutation.isPending ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-3.5 w-3.5 animate-spin"
                />
              ) : (
                <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" />
              )}
              <span>Delete</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={
                  updateTaskMutation.isPending || deleteTaskMutation.isPending
                }
                className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  updateTaskMutation.isPending || deleteTaskMutation.isPending
                }
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
          </div>
        </form>
      </div>
    </div>
  );
};
