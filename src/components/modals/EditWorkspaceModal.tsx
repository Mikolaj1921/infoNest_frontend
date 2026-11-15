'use client';

import { useState, type FormEvent } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { useUpdateWorkspace } from '@/features/workspaces/hooks/use-workspace-mutations';

export const EditWorkspaceModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'editWorkspace';

  if (!isModalOpen) return null;

  return (
    <EditWorkspaceForm
      key={`${data.workspaceId}-${data.workspaceName}`}
      workspaceId={data.workspaceId}
      workspaceName={data.workspaceName ?? ''}
      onClose={onClose}
    />
  );
};

interface EditWorkspaceFormProps {
  workspaceId?: string;
  workspaceName: string;
  onClose: () => void;
}

const EditWorkspaceForm = ({
  workspaceId,
  workspaceName,
  onClose,
}: EditWorkspaceFormProps) => {
  const [name, setName] = useState(workspaceName);
  const { mutateAsync: updateWorkspace, isPending } = useUpdateWorkspace();

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!workspaceId || !trimmedName) return;

    if (trimmedName === workspaceName) {
      onClose();
      return;
    }

    try {
      await updateWorkspace({
        workspaceId,
        dto: { name: trimmedName },
      });

      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-lg border border-border bg-background p-6 shadow-lg animate-in zoom-in-95 duration-200">
        <h2 className="mb-2 text-left text-xl font-bold">Rename Workspace</h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Enter a new name for your workspace.
        </p>

        <form onSubmit={onSubmit}>
          <label
            htmlFor="workspace-name"
            className="mb-2 block text-sm font-medium"
          >
            Workspace name
          </label>

          <input
            id="workspace-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            autoFocus
            required
            disabled={isPending}
            className="mb-5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
