// ua: Модалка підтвердження видалення категорії (management of categories)

'use client';

// hooks
import { useModal } from '@/hooks/use-modal-store';

// ua: хук для мутацій категорій
import { useDeleteCategory } from '@/features/documents/hooks/use-category-mutations';

export const DeleteCategoryConfirmModal = () => {
  // states
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'deleteCategory';
  const { categoryName, categoryId } = data || {};

  // hook
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory(); // ua: виклик хук

  // ua: функція підтвердження видалення категорії
  const onConfirm = async () => {
    try {
      if (categoryId) {
        await deleteCategory(categoryId); // ua:  каскадне видалення
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
          Delete Category?
        </h2>

        <div className="rounded-md bg-destructive/10 p-3 mb-4 text-left border border-destructive/20">
          <p className="text-sm font-semibold text-destructive">
            Critical Warning:
          </p>
          <p className="text-sm text-destructive/90 mt-0.5">
            Are you sure? This will delete the folder{' '}
            <span className="font-bold">&quot;{categoryName}&quot;</span> and
            all documents within this category cascade on the server. Data
            recovery will be impossible.
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
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete Permanently'}
          </button>
        </div>
      </div>
    </div>
  );
};
