// ua: хук для мутацій категорій (створення та видалення папок)

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoryService,
  CreateCategoryDTO,
} from '@/services/category.service';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';

// ua: хук для створення нової категорії
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  return useMutation({
    mutationFn: (dto: CreateCategoryDTO) =>
      categoryService.createCategory(workspaceId, dto),
    onSuccess: () => {
      toast.success('Folder created successfully');
      // ua: валідація кешу структури для миттєвого оновлення Сайдбару
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to create folder. Please try again.');
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
    onSuccess: (_, categoryId) => {
      toast.success('Folder and all its documents deleted');

      // ua: Інвалідація кешу для оновлення дерева документів
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });

      // поточний стан структури з кешу, щоб перевірити, чи знаходився користувач у документі з цієї папки
      const cachedData = queryClient.getQueryData<{
        data: { id: string; documents: { id: string }[] }[];
      }>(['workspace-structure', workspaceId]);

      if (cachedData?.data) {
        const deletedCategory = cachedData.data.find(
          (cat) => cat.id === categoryId,
        );
        const wasActiveDocInside = deletedCategory?.documents.some(
          (doc) => doc.id === activeDocId,
        );

        // якщо видалена папка була активною або містила відкритий документ редірект на головну воркспейсу
        if (wasActiveDocInside || !activeDocId) {
          router.push(`/workspaces/${workspaceId}`);
        }
      } else {
        //якщо кеш порожній, редірект на головну сторінку воркспейсу
        router.push(`/workspaces/${workspaceId}`);
      }
    },
    onError: () => {
      toast.error('Failed to delete folder. Please try again.');
    },
  });
};
