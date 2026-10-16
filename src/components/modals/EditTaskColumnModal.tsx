'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '@/hooks/use-modal-store';
import { useUpdateColumn, useDeleteColumn } from '@/hooks/useKanbanData';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faSpinner,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';

const columnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(100),
});

type ColumnFormValues = {
  name: string;
};

export const EditTaskColumnModal = () => {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { isOpen, type, data, onClose, onOpen } = useModal();
  const isModalOpen = isOpen && type === 'editTaskColumn';
  const { columnId, columnName } = data;

  const updateColumnMutation = useUpdateColumn(workspaceId);
  const deleteColumnMutation = useDeleteColumn(workspaceId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
  });

  useEffect(() => {
    if (columnName) {
      reset({ name: columnName });
    }
  }, [columnName, reset]);

  const onSubmit: SubmitHandler<ColumnFormValues> = async (values) => {
    if (!columnId) return;

    updateColumnMutation.mutate(
      { columnId, name: values.name.trim() },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleDelete = () => {
    if (!columnId) return;

    onOpen('confirmDeleteTask', {
      confirmTitle: 'Delete Task Column?',
      confirmDescription: `Are you sure you want to delete the column "${columnName}" along with all its tasks?`,
      onConfirm: async () => {
        return new Promise<void>((resolve, reject) => {
          deleteColumnMutation.mutate(columnId, {
            onSuccess: () => resolve(),
            onError: (err) => reject(err),
          });
        });
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
          <h3 className="text-base font-bold text-foreground">Edit Column</h3>
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
              Column Name
            </label>
            <input
              {...register('name')}
              type="text"
              disabled={
                updateColumnMutation.isPending || deleteColumnMutation.isPending
              }
              className="w-full rounded-xl border border-border/60 bg-background/50 px-3.5 py-2 text-xs focus:border-primary/40 focus:outline-hidden transition"
            />
            {errors.name && (
              <p className="text-[10px] font-semibold text-destructive">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/20">
            <button
              type="button"
              onClick={handleDelete}
              disabled={
                updateColumnMutation.isPending || deleteColumnMutation.isPending
              }
              className="h-9 px-3 rounded-xl border border-destructive/30 hover:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {deleteColumnMutation.isPending ? (
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
                  updateColumnMutation.isPending ||
                  deleteColumnMutation.isPending
                }
                className="rounded-xl border border-border/60 px-4 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  updateColumnMutation.isPending ||
                  deleteColumnMutation.isPending
                }
                className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm"
              >
                {updateColumnMutation.isPending && (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-3 w-3 animate-spin"
                  />
                )}
                <span>Saved</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
