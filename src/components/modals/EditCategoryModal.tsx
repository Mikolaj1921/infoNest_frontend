'use client';

import { useState } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { useUpdateCategory } from '@/features/documents/hooks/use-category-mutations';

export const EditCategoryModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === 'editCategory';

  if (!isModalOpen) return null;

  return (
    <EditCategoryForm
      key={`${data.categoryId}-${data.categoryName}`}
      categoryId={data.categoryId}
      categoryName={data.categoryName ?? ''}
      onClose={onClose}
    />
  );
};

interface EditCategoryFormProps {
  categoryId?: string;
  categoryName: string;
  onClose: () => void;
}

const EditCategoryForm = ({
  categoryId,
  categoryName,
  onClose,
}: EditCategoryFormProps) => {
  const [name, setName] = useState(categoryName);
  const { mutateAsync: updateCategory, isPending } = useUpdateCategory();

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!categoryId || !trimmedName) return;

    if (trimmedName === categoryName) {
      onClose();
      return;
    }

    try {
      await updateCategory({
        categoryId,
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
        <h2 className="mb-2 text-left text-xl font-bold">Rename Category</h2>

        <p className="mb-4 text-sm text-muted-foreground">
          Enter a new name for the folder.
        </p>

        <form onSubmit={onSubmit}>
          <label
            htmlFor="category-name"
            className="mb-2 block text-sm font-medium"
          >
            Folder name
          </label>

          <input
            id="category-name"
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
