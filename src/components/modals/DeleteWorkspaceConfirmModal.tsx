'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useModal } from '@/hooks/use-modal-store';
import { useDeleteWorkspace } from '@/features/workspaces/hooks/use-workspace-mutations';

export const DeleteWorkspaceConfirmModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'deleteWorkspace';

  const router = useRouter();
  const pathname = usePathname();

  const { mutateAsync: deleteWorkspace, isPending } = useDeleteWorkspace();

  const { workspaceId, workspaceName } = data;

  const onConfirm = async () => {
    if (!workspaceId) return;

    try {
      await deleteWorkspace(workspaceId);
      onClose();

      // ua: якщо видалений воркспейс зараз відкритий — повертаємося до списку
      if (
        pathname === `/workspaces/${workspaceId}` ||
        pathname.startsWith(`/workspaces/${workspaceId}/`)
      ) {
        router.push('/workspaces');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-destructive/20 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-destructive mb-2 text-left">
          Delete Workspace?
        </h2>

        <div className="rounded-md bg-destructive/10 p-3 mb-4 text-left border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">
            Critical Warning:
          </p>

          <p className="text-sm text-destructive/90 mt-0.5">
            Are you sure you want to delete the workspace{' '}
            <span className="font-bold">&quot;{workspaceName}&quot;</span>? All
            documents, categories, tasks, whiteboard data and other workspace
            content may be permanently deleted. This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending || !workspaceId}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
