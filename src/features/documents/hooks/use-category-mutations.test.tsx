// tests hooks for category mutations - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateCategory, useDeleteCategory } from './use-category-mutations';
import { categoryService } from '@/services/category.service';
import { toast } from 'sonner';
import React from 'react';

vi.mock('@/services/category.service', () => ({
  categoryService: {
    createCategory: vi.fn(),
    deleteCategory: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ id: 'ws-123', docId: 'doc-1' }),
}));

describe('Category Mutations Hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('useCreateCategory', () => {
    it('має викликати інвалідацію кешу та тост успіху після створення категорії', async () => {
      const mockCategory = { id: 'cat-1', name: 'Папка Тест' };
      vi.mocked(categoryService.createCategory).mockResolvedValueOnce(
        // eslint-disable-next-line
        mockCategory as any,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateCategory(), { wrapper });

      result.current.mutate({ name: 'Папка Тест' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(categoryService.createCategory).toHaveBeenCalledWith('ws-123', {
        name: 'Папка Тест',
      });

      expect(toast.success).toHaveBeenCalledWith('Folder created successfully');

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });
  });

  describe('useDeleteCategory', () => {
    it('має викликати інвалідацію кешу після видалення папки', async () => {
      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });
  });

  describe('useDeleteCategory', () => {
    it('має викликати інвалідацію кешу після видалення папки', async () => {
      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(categoryService.deleteCategory).toHaveBeenCalledWith('cat-1');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    it('має автоматично редіректити на головну сторінку воркспейсу, якщо видалена папка містила активний документ', async () => {
      vi.mocked(categoryService.deleteCategory).mockResolvedValueOnce(
        undefined,
      );

      queryClient.setQueryData(['workspace-structure', 'ws-123'], {
        data: [
          {
            id: 'cat-1',
            documents: [{ id: 'doc-1' }],
          },
        ],
      });

      const { result } = renderHook(() => useDeleteCategory(), { wrapper });

      result.current.mutate('cat-1');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPush).toHaveBeenCalledWith('/workspaces/ws-123');
    });
  });
});
