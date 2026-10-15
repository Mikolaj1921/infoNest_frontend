// modal for creating a new task column in the kanban board

'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/use-modal-store';
import { useCreateColumn } from '@/hooks/useKanbanData';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSpinner } from '@fortawesome/free-solid-svg-icons';

const columnSchema = z.object({
  name: z.string().min(1, 'Name of the column is required').max(100),
});

type ColumnFormValues = {
  name: string;
};

export const CreateTaskColumnModal = () => {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, onClose } = useModal();
  const isModalOpen = isOpen && type === 'createTaskColumn';

  const createColumnMutation = useCreateColumn(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit: SubmitHandler<ColumnFormValues> = async (values) => {
    createColumnMutation.mutate(values.name.trim(), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">
            Create New Column
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg text-muted-foreground/60 hover:text-foreground hover:bg-accent/50 flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/80">
              Name of the new column
            </label>
            <input
              {...register('name')}
              type="text"
              disabled={createColumnMutation.isPending}
              placeholder="E.g., In Progress, Testing..."
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition"
            />
            {errors.name && (
              <p className="text-[10px] font-semibold text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={createColumnMutation.isPending}
              className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createColumnMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              {createColumnMutation.isPending && (
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
