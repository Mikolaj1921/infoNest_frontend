import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../use-category-mutations';

import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';

// ua: мок функції навігації
const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

// ua: мок сервісу категорій
vi.mock('@/services/category.service', () => ({
  categoryService: {
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

// ua: мок повідомлень
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ua: мок Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({
    id: 'ws-123',
    docId: 'doc-1',
  }),
}));

describe('Category Mutations Hooks', () => {
  let queryClient: QueryClient;

  // ua: створення ізольованого QueryClient перед кожним тестом
  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();
  });

  // ua: обгортка для підключення React Query до тестованих хуків
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // =====================================================
  // useCreateCategory
  // =====================================================

  describe('useCreateCategory', () => {
    // 1. Успішне створення категорії
    it('1. Повинен створювати категорію та викликати повідомлення про успіх', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Папка Тест',
      };

      vi.mocked(categoryService.createCategory).mockResolvedValueOnce(
        mockCategory as Awaited<
          ReturnType<typeof categoryService.createCategory>
        >,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate({
        name: 'Папка Тест',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(categoryService.createCategory).toHaveBeenCalledTimes(1);
      expect(categoryService.createCategory).toHaveBeenCalledWith(
        'ws-123',
        'Папка Тест',
      );

      expect(toast.success).toHaveBeenCalledWith('Folder created successfully');

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    // 2. Помилка створення категорії
    it('2. Повинен показувати повідомлення про помилку при невдалому створенні', async () => {
      vi.mocked(categoryService.createCategory).mockRejectedValueOnce(
        new Error('Creation failed'),
      );

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate({
        name: 'Папка Тест',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create folder. Please try again.',
      );

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // useUpdateCategory
  // =====================================================

  describe('useUpdateCategory', () => {
    // 3. Успішне перейменування категорії
    it('3. Повинен перейменовувати категорію та показувати повідомлення про успіх', async () => {
      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Нова назва',
      };

      vi.mocked(categoryService.updateCategory).mockResolvedValueOnce(
        mockUpdatedCategory as Awaited<
          ReturnType<typeof categoryService.updateCategory>
        >,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-1',
        dto: {
          name: 'Нова назва',
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(categoryService.updateCategory).toHaveBeenCalledWith('cat-1', {
        name: 'Нова назва',
      });

      expect(toast.success).toHaveBeenCalledWith('Folder renamed successfully');

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    // 4. Оновлення категорії в кеші
    it('4. Повинен оновлювати категорію в кеші після успішного перейменування', async () => {
      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Стара назва',
          },
          {
            id: 'cat-2',
            name: 'Інша папка',
          },
        ],
      );

      const mockUpdatedCategory = {
        id: 'cat-1',
        name: 'Нова назва',
      };

      vi.mocked(categoryService.updateCategory).mockResolvedValueOnce(
        mockUpdatedCategory as Awaited<
          ReturnType<typeof categoryService.updateCategory>
        >,
      );

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-1',
        dto: {
          name: 'Нова назва',
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedCategories = queryClient.getQueryData<
        { id: string; name: string }[]
      >(['workspace-structure', 'ws-123']);

      expect(cachedCategories).toEqual([
        {
          id: 'cat-1',
          name: 'Нова назва',
        },
        {
          id: 'cat-2',
          name: 'Інша папка',
        },
      ]);
    });

    // 5. Збереження інших категорій у кеші
    it('5. Повинен зберігати інші категорії без змін під час перейменування', async () => {
      const otherCategory = {
        id: 'cat-2',
        name: 'Інша папка',
        documents: [{ id: 'doc-2' }],
      };

      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Стара назва',
          },
          otherCategory,
        ],
      );

      vi.mocked(categoryService.updateCategory).mockResolvedValueOnce({
        id: 'cat-1',
        name: 'Оновлена назва',
      } as Awaited<ReturnType<typeof categoryService.updateCategory>>);

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-1',
        dto: {
          name: 'Оновлена назва',
        },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedCategories = queryClient.getQueryData<
        { id: string; name: string; documents?: { id: string }[] }[]
      >(['workspace-structure', 'ws-123']);

      expect(cachedCategories?.[1]).toEqual(otherCategory);
    });

    // 6. Помилка перейменування
    it('6. Повинен показувати повідомлення про помилку при невдалому перейменуванні', async () => {
      vi.mocked(categoryService.updateCategory).mockRejectedValueOnce(
        new Error('Update failed'),
      );

      const { result } = renderHook(() => useUpdateCategory(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-1',
        dto: {
          name: 'Нова назва',
        },
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to rename folder. Please try again.',
      );

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // useDeleteCategory
  // =====================================================

  describe('useDeleteCategory', () => {
    // 7. Успішне видалення категорії
    it('7. Повинен видаляти категорію та показувати повідомлення про успіх', async () => {
      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Папка для видалення',
            documents: [],
          },
        ],
      );

      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat-1');

      expect(toast.success).toHaveBeenCalledWith(
        'Folder and all its documents deleted',
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    // 8. Видалення категорії з кешу
    it('8. Повинен миттєво видаляти категорію з кешу', async () => {
      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Папка для видалення',
            documents: [],
          },
          {
            id: 'cat-2',
            name: 'Папка для збереження',
            documents: [],
          },
        ],
      );

      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      const cachedCategories = queryClient.getQueryData<
        { id: string; name: string }[]
      >(['workspace-structure', 'ws-123']);

      expect(cachedCategories).toEqual([
        {
          id: 'cat-2',
          name: 'Папка для збереження',
          documents: [],
        },
      ]);
    });

    // 9. Редірект при видаленні категорії з активним документом
    it('9. Повинен перенаправляти на сторінку воркспейсу, якщо категорія містила активний документ', async () => {
      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Папка з активним документом',
            documents: [{ id: 'doc-1' }, { id: 'doc-2' }],
          },
        ],
      );

      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPush).toHaveBeenCalledWith('/workspaces/ws-123');
    });

    // 10. Відсутність редіректу при видаленні іншої категорії
    it('10. Не повинен перенаправляти, якщо видалена категорія не містила активний документ', async () => {
      queryClient.setQueryData(
        ['workspace-structure', 'ws-123'],
        [
          {
            id: 'cat-1',
            name: 'Інша папка',
            documents: [{ id: 'doc-2' }],
          },
        ],
      );

      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    // 11. Помилка видалення категорії
    it('11. Повинен показувати повідомлення про помилку при невдалому видаленні', async () => {
      vi.mocked(categoryService.deleteCategory).mockRejectedValueOnce(
        new Error('Deletion failed'),
      );

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to delete folder. Please try again.',
      );

      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
