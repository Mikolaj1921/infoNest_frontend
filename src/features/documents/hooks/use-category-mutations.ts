// ua: хук для мутацій категорій (створення та видалення папок)

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoryService,
  UpdateCategoryDTO,
} from '@/services/category.service';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

// ua: хук для створення нової категорії
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  return useMutation({
    mutationFn: (dto: { name: string }) =>
      categoryService.createCategory(workspaceId, dto.name),
    onSuccess: () => {
      toast.success('Folder created successfully');

      // ua: валідація кешу структури для оновлення сайдбару
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to create folder. Please try again.');
    },
  });
};

// ua: хук для оновлення назви категорії
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const params = useParams();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  return useMutation({
    mutationFn: ({
      categoryId,
      dto,
    }: {
      categoryId: string;
      dto: UpdateCategoryDTO;
    }) => categoryService.updateCategory(categoryId, dto),

    onSuccess: (updatedCategory) => {
      // ua: оновлюємо дерево документів у сайдбарі та на сторінці воркспейсу
      queryClient.setQueryData(
        ['workspace-structure', workspaceId],
        (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }

          return current.map((category) =>
            category.id === updatedCategory.id
              ? { ...category, ...updatedCategory }
              : category,
          );
        },
      );

      // ua: синхронізуємо структуру з бекендом
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });

      toast.success('Folder renamed successfully');
    },

    onError: () => {
      toast.error('Failed to rename folder. Please try again.');
    },
  });
};

// ua: хук для повного каскадного видалення папки
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';
  const activeDocId = typeof params?.docId === 'string' ? params.docId : '';

  return useMutation({
    mutationFn: (categoryId: string) =>
      categoryService.deleteCategory(categoryId),

    onSuccess: async (_, categoryId) => {
      // ua: отримуємо актуальний кеш структури воркспейсу
      const cachedData = queryClient.getQueryData<
        { id: string; documents: { id: string }[] }[]
      >(['workspace-structure', workspaceId]);

      // ua: перевіряємо, чи містила видалена категорія активний документ
      const deletedCategory = cachedData?.find(
        (category) => category.id === categoryId,
      );

      const wasActiveDocInside = deletedCategory?.documents.some(
        (doc) => doc.id === activeDocId,
      );

      // ua: миттєво прибираємо видалену категорію з кешу
      queryClient.setQueryData(
        ['workspace-structure', workspaceId],
        (
          current: { id: string; documents: { id: string }[] }[] | undefined,
        ) => {
          if (!current) {
            return current;
          }

          return current.filter((category) => category.id !== categoryId);
        },
      );

      toast.success('Folder and all its documents deleted');

      // ua: синхронізуємо кеш із бекендом
      await queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });

      // ua: якщо видалена папка містила відкритий документ — повертаємося до воркспейсу
      if (wasActiveDocInside) {
        router.push(`/workspaces/${workspaceId}`);
      }
    },

    onError: () => {
      toast.error('Failed to delete folder. Please try again.');
    },
  });
};
