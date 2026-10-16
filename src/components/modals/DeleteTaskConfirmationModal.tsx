'use client';

import React, { useState } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export const DeleteTaskConfirmationModal = () => {
  const { isOpen, type, data, onClose } = useModal();
  const isModalOpen = isOpen && type === 'confirmDeleteTask';
  const { confirmTitle, confirmDescription, onConfirm } = data;

  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    try {
      setIsPending(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm rounded-2xl border  bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Іконка попередження та заголовок */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-4 w-4" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-sm font-bold text-foreground truncate">
              {confirmTitle || 'Confirm Deletion'}
            </h3>
            <p className="text-xs text-muted-foreground leading-normal">
              {confirmDescription ||
                'This action cannot be undone. Are you sure you want to proceed?'}
            </p>
          </div>
        </div>

        {/* Панель кнопок дій */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/20">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-border/60 bg-transparent px-3.5 py-2 text-xs font-bold text-foreground hover:bg-accent/50 transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-2 text-xs font-bold text-destructive-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isPending && (
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-3 w-3 animate-spin"
              />
            )}
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
