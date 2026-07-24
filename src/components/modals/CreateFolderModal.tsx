// ua: Модалка для створення нової папки у воркспейсі
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useModal } from '../../hooks/use-modal-store';
import { useParams } from 'next/navigation';

// mutation hook
import { useCreateCategory } from '@/features/documents/hooks/use-category-mutations'; // ua: додано

// validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Name is required' })
    .max(30, { message: 'Name cannot exceed 30 characters' }),
});

// ua: типи для форми
type FormValues = z.infer<typeof formSchema>;

export const CreateFolderModal = () => {
  const { isOpen, onClose, type } = useModal();
  const params = useParams();
  // eslint-disable-next-line
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { mutateAsync: createCategory, isPending } = useCreateCategory(); // ua: виклик хук

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

  // for creating a new category
  const onSubmit = async (values: FormValues) => {
    try {
      await createCategory({ name: values.name });
      reset();
      onClose();
    } catch (error) {
      console.error(error);
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Category Name
            </label>
            <input
              {...register('name')}
              type="text"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="For example: Marketing, Sprint 5..."
            />
            {errors.name && (
              <p className="text-xs font-medium text-destructive mt-1">
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
      </div>
    </div>
  );
};
