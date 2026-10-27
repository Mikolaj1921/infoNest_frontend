// ua: Модалка для створення нової папки у воркспейсі
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '../../hooks/use-modal-store';
import { useParams } from 'next/navigation';

// mutation hook
import { useCreateCategory } from '@/features/documents/hooks/use-category-mutations';

// validation schema - fixed (add min 3 char chech)
const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, {
      message: 'Category name must be at least 3 characters long.',
    })
    .max(30, {
      message: 'Category name cannot exceed 30 characters.',
    }),
});

// ua: типи для форми
type FormValues = z.infer<typeof formSchema>;

export const CreateFolderModal = () => {
  const { isOpen, onClose, type } = useModal();
  const params = useParams();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { mutateAsync: createCategory, isPending } = useCreateCategory();

  const isModalOpen = isOpen && type === 'createCategory';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  // ua: створення нової категорії
  const onSubmit = async (values: FormValues) => {
    try {
      await createCategory({ name: values.name.trim() });
      reset();
      onClose();
    } catch (error) {
      // ua: помилка вже обробляється хуком мутації
      console.error('Failed to create category:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-lg border border-border animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold text-foreground mb-1 text-left">
          Create New Category
        </h2>

        <p className="text-sm text-muted-foreground mb-4 text-left">
          Add a new category to organize your documents in the workspace.
        </p>

        {!workspaceId ? (
          <div className="space-y-4 text-left">
            <div className="rounded-md bg-amber-500/10 p-3 border border-amber-500/20">
              <p className="text-sm text-amber-500 font-medium">
                Warning: No workspace selected.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Folders (categories) can only be created within a specific
                workspace. Please select or create a workspace in the top menu
                before setting up the structure.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                Of cource
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label
                htmlFor="category-name"
                className="text-xs font-semibold uppercase text-muted-foreground"
              >
                Category Name
              </label>

              <input
                id="category-name"
                {...register('name')}
                type="text"
                autoFocus
                maxLength={30}
                aria-invalid={!!errors.name}
                aria-describedby={
                  errors.name ? 'category-name-error' : undefined
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="For example: Marketing, Sprint 5..."
              />

              {errors.name && (
                <p
                  id="category-name-error"
                  role="alert"
                  className="text-xs font-medium text-destructive mt-1"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isPending ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
