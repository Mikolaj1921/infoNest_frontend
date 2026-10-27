'use client';

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  useMemo,
} from 'react';

import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';
import { WorkspaceFolderItem, TaskCategory } from '@/types/kanban';
import { useModal } from '@/hooks/use-modal-store';
// hooks
import { useWorkspaceKanban } from '@/hooks/useKanbanData';
import {
  useUpdateTask,
  useDeleteTask,
  useLinkDocument,
  useUnlinkDocument,
} from '@/hooks/useKanbanData'; // ua: хуки оновлення та видалення
import { useParams, useRouter } from 'next/navigation';
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faSpinner,
  faTrashCan,
  faCalendarDays,
  faChevronDown,
  faFolder,
  faFileLines,
  faCheck,
  faPaperclip,
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
  const router = useRouter();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, data, onClose, onOpen } = useModal();
  const isModalOpen = isOpen && type === 'editBoardTask';
  //const { task } = data; // ua: витягуємо поточну таску для редагування
  const { task: initialTask } = data;

  const updateTaskMutation = useUpdateTask(workspaceId);
  const deleteTaskMutation = useDeleteTask(workspaceId);

  // linked & unlinked doc
  const linkDocumentMutation = useLinkDocument(workspaceId);
  const unlinkDocumentMutation = useUnlinkDocument(workspaceId);

  // стейт для керування видимістю випадаючого дерева документів
  const [isTreeOpen, setIsTreeOpen] = useState(false);

  // динамічне відображення змін без закриття модалки( зміни на ходу )
  const workspaceKanbanQuery = useWorkspaceKanban(workspaceId);
  const categories = workspaceKanbanQuery.data as unknown as
    | TaskCategory[]
    | undefined;

  // Оскільки роль зазвичай передається у відповіді воркспейсу або структури,
  // якщо вона приходить у query то беремо її, інакше по дефолту даємо Editor для сумісності
  // eslint-disable-next-line
  const userRole = (workspaceKanbanQuery.data as any)?.role || 'Editor';
  const canEdit =
    userRole === 'Owner' || userRole === 'Admin' || userRole === 'Editor';

  // зміни в вікні( на ходу )
  const task = useMemo(() => {
    if (!isModalOpen || !initialTask || !categories) return initialTask;

    // шукаємо таску в актуальному масиві категорій, який оновився після мутації лінкування
    for (const col of categories) {
      const found = col.boardTasks?.find((t) => t.id === initialTask.id);
      if (found) return found;
    }
    return initialTask;
  }, [categories, initialTask, isModalOpen]);

  // tree structure doc
  const { data: workspaceStructure, isLoading: isTreeLoading } = useQuery<
    WorkspaceFolderItem[]
  >({
    queryKey: ['workspace-structure', workspaceId],
    queryFn: async () => {
      const { data: res } = await api.get<{
        success: boolean;
        data: WorkspaceFolderItem[];
      }>(`/workspaces/${workspaceId}/structure`);
      return res.success ? res.data : [];
    },
    enabled: isModalOpen && !!workspaceId,
  });

  //---

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
        // додано закриття списку при закритті модалки
        onSuccess: () => {
          setIsTreeOpen(false);
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

  const handleToggleDocument = (documentId: string, isAttached: boolean) => {
    if (!task) return;
    if (isAttached) {
      unlinkDocumentMutation.mutate({ taskId: task.id, documentId });
    } else {
      linkDocumentMutation.mutate({ taskId: task.id, documentId });
    }
  };

  if (!isModalOpen || !task) return null;

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

          {/* ua: зона додавання док */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-bold text-foreground/80">
              Attach Knowledge Documents
            </label>
            <button
              type="button"
              disabled={!canEdit}
              onClick={() => setIsTreeOpen(!isTreeOpen)}
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs flex items-center justify-between transition text-muted-foreground hover:text-foreground hover:bg-accent/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faPaperclip}
                  className="h-3.5 w-3.5 text-primary"
                />
                <span>Link documents to this task...</span>
              </div>
              <FontAwesomeIcon
                icon={faChevronDown}
                className={`h-3 w-3 transition-transform duration-200 ${isTreeOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isTreeOpen && (
              <div className="absolute top-full left-0 w-full mt-1.5 rounded-xl border border-border bg-popover p-2.5 shadow-xl max-h-56 overflow-y-auto z-50 space-y-3 text-left animate-in fade-in slide-in-from-top-1 duration-150 scrollbar-thin">
                {isTreeLoading ? (
                  <div className="text-[11px] text-muted-foreground animate-pulse p-1 flex items-center gap-2">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin text-primary"
                    />
                    <span>Loading documents tree...</span>
                  </div>
                ) : workspaceStructure && workspaceStructure.length > 0 ? (
                  workspaceStructure.map((folder) => {
                    // створюємо Set ID вже лінкованих доків для О(1) перевірки
                    const attachedDocIds = new Set(
                      // eslint-disable-next-line
                      task.documents?.map((d: any) => d.id) || [],
                    );

                    return (
                      <div key={folder.id} className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/60 px-1">
                          <FontAwesomeIcon
                            icon={faFolder}
                            className="text-amber-500/80 h-3.5 w-3.5"
                          />
                          <span>{folder.name}</span>
                        </div>

                        <div className="pl-3.5 space-y-0.5">
                          {folder.documents && folder.documents.length > 0 ? (
                            folder.documents.map((doc) => {
                              const isAttached = attachedDocIds.has(doc.id);
                              return (
                                <button
                                  key={doc.id}
                                  type="button"
                                  onClick={() =>
                                    handleToggleDocument(doc.id, isAttached)
                                  }
                                  disabled={
                                    linkDocumentMutation.isPending ||
                                    unlinkDocumentMutation.isPending
                                  }
                                  className={`w-full flex items-center justify-between text-[11px] px-2 py-1 rounded-lg transition cursor-pointer ${
                                    isAttached
                                      ? 'bg-primary/10 text-primary font-semibold'
                                      : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <FontAwesomeIcon
                                      icon={faFileLines}
                                      className="h-3 w-3 opacity-60"
                                    />
                                    <span className="truncate">
                                      {doc.title}
                                    </span>
                                  </div>
                                  {isAttached && (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className="h-3 w-3 shrink-0"
                                    />
                                  )}
                                </button>
                              );
                            })
                          ) : (
                            <div className="text-[10px] text-muted-foreground/30 italic pl-5">
                              Empty folder
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[11px] text-muted-foreground/40 italic text-center py-2">
                    No documents found
                  </div>
                )}
              </div>
            )}
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

          {/* зона прикріплень доків до таски */}
          {task.documents && task.documents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-border/20">
              <label className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
                <FontAwesomeIcon
                  icon={faPaperclip}
                  className="h-3 w-3 text-muted-foreground"
                />
                <span>Attached Knowledge ({task.documents.length})</span>
              </label>

              <div className="space-y-1.5 max-h-32 overflow-y-auto scrollbar-thin">
                {task.documents.map((doc: { id: string; title: string }) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 rounded-xl border border-border/55 bg-secondary/20 text-xs text-foreground/90 transition hover:bg-secondary/40"
                  >
                    {/* ua: треба пофіксити щоб переходило на док */}
                    <button
                      type="button"
                      onClick={() => {
                        router.push(
                          `/workspaces/${workspaceId}/documents/${doc.id}`,
                        );
                        onClose();
                      }}
                      className="flex items-center gap-2 truncate min-w-0 text-left hover:text-primary hover:underline cursor-pointer transition-colors"
                      title="Open and edit this document"
                    >
                      <FontAwesomeIcon
                        icon={faFileLines}
                        className="h-3.5 w-3.5 text-primary/70 shrink-0"
                      />
                      <span className="truncate font-semibold">
                        {doc.title}
                      </span>
                    </button>

                    {canEdit && (
                      <button
                        type="button"
                        onClick={() =>
                          unlinkDocumentMutation.mutate({
                            taskId: task.id,
                            documentId: doc.id,
                          })
                        }
                        disabled={unlinkDocumentMutation.isPending}
                        className="h-6 w-6 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition shrink-0 cursor-pointer disabled:opacity-40"
                        title="Detach document"
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
