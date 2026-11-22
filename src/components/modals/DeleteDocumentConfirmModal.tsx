'use client';

import { useModal } from '@/hooks/use-modal-store';
import { useDeleteDocument } from '@/features/documents/hooks/use-document-mutations';

export const DeleteDocumentConfirmModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'deleteDocument';

  const { mutateAsync: deleteDocument, isPending } = useDeleteDocument(); // ua: підключаємо хук мутації

  // eslint-disable-next-line
  const { documentTitle, documentId } = data || {};

  const onConfirm = async () => {
    try {
      if (documentId) {
        await deleteDocument(documentId);
        onClose();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-destructive/20 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-destructive mb-2 text-left">
          Delete Document?
        </h2>

        <div className="rounded-md bg-destructive/10 p-3 mb-4 text-left border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">Attention:</p>
          <p className="text-sm text-destructive/90 mt-0.5">
            Are you sure you want to delete this document? This action cannot be
            undone.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
