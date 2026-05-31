'use client';

import { useEffect, useRef } from 'react';
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
// hooks
import { useWorkspaceForm } from '../hooks/useWorkspaceForm';
import { useCreateWorkspace } from '../hooks/useCreateWorkspace';
// UI components
import { AuthInput } from '@/components/ui/AuthInput';
import { AuthButton } from '@/components/ui/AuthButton';
// types & validators
import { WorkspaceVisibility } from '@/types/workspace';
import { CreateWorkspaceInput } from '@/validators/workspace.schema';

// ua: interface для пропсів модалки
interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ua: компонент модального вікна для створення нового воркспейсу
export const CreateWorkspaceModal = ({
  isOpen,
  onClose,
}: CreateWorkspaceModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useWorkspaceForm();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // ua: хук для створення воркспейсу з авто оновленням списку та глобальним обробником помилок
  const { mutate, isPending } = useCreateWorkspace({
    onSuccessCb: () => {
      reset();
      onClose();
    },
  });

  // ua: ефект для керування open/closed modal та блок скролу фону
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else {
      dialog.close();
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const onSubmit = (data: CreateWorkspaceInput) => {
    mutate(data);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 z-50 m-auto w-full max-w-md rounded-2xl border border-border bg-card/95 p-6 shadow-2xl backdrop:bg-background/60 backdrop:backdrop-blur-sm outline-none animate-in fade-in zoom-in-95 duration-200"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/20">
              <FontAwesomeIcon icon={faFolderPlus} className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Create Workspace
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <AuthInput
            label="Workspace Name"
            type="text"
            placeholder="e.g., Marketing Team, Personal Notes"
            disabled={isPending}
            error={errors.name?.message}
            {...register('name')}
          />

          <div className="space-y-1.5 w-full text-left">
            <label className="text-xs font-medium text-muted-foreground">
              Visibility Status
            </label>
            <select
              disabled={isPending}
              className="h-10 w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm text-foreground outline-none transition-all focus:border-primary/50 focus:ring-1 focus:ring-primary/20 cursor-pointer disabled:opacity-50"
              {...register('visibility')}
            >
              <option value={WorkspaceVisibility.PRIVATE} className="bg-card">
                Private (Only you can access)
              </option>
              <option value={WorkspaceVisibility.PUBLIC} className="bg-card">
                Public (Anyone with link can view)
              </option>
            </select>
            {errors.visibility && (
              <p className="text-xs text-destructive animate-in fade-in duration-200">
                {errors.visibility.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <AuthButton type="submit" isLoading={isPending}>
              Create &rarr;
            </AuthButton>
          </div>
        </form>
      </div>
    </dialog>
  );
};
