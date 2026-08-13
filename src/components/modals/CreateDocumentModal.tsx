'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModal } from '@/hooks/use-modal-store';
import {
  createDocumentSchema,
  CreateDocumentFormValues,
} from '@/validators/document.schema'; // ua: чистий імпорт

export const CreateDocumentModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { categoryName, categoryId } = data || {};

  const isModalOpen = isOpen && type === 'createDocument';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: { title: '' },
  });

  const onSubmit = async (values: CreateDocumentFormValues) => {
    try {
      console.log('Створення документа у категорії:', categoryId, values);
      // ua: Логіку мутацій TanStack Query та авто-редірект підключимо у фінальній сабтасці
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
          Create Document in
        </h2>
        <p className="text-sm text-muted-foreground mb-4 text-left">
          Document will be created inside the folder{' '}
          <span className="font-semibold text-primary">{categoryName}</span>.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold uppercase text-muted-foreground">
              Document Title
            </label>
            <input
              {...register('title')}
              type="text"
              autoFocus
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="Наприклад: ТЗ Спринт 6, Нотатки з мітингу..."
            />
            {errors.title && (
              <p className="text-xs font-medium text-destructive mt-1">
                {errors.title.message}
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
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-sm"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
