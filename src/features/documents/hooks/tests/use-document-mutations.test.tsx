import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useCreateDocument,
  useDeleteDocument,
} from '../use-document-mutations';

import { documentService } from '@/services/document.service';
import { DocumentVisibility } from '@/types/document';
import { toast } from 'sonner';

// ua: спільний мок навігації
const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

// ua: мок сервісу документів
vi.mock('@/services/document.service', () => ({
  documentService: {
    createDocument: vi.fn(),
    deleteDocument: vi.fn(),
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
  useRouter: () => ({
    push: mockPush,
  }),
  useParams: () => ({
    id: 'ws-123',
    docId: 'doc-active',
  }),
}));

describe('Document Mutations Hooks', () => {
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

  // ua: обгортка для підключення React Query
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  // =====================================================
  // useCreateDocument
  // =====================================================

  describe('useCreateDocument', () => {
    // 1. Успішне створення документа
    it('1. Повинен створювати документ з правильними параметрами та інвалідувати кеш', async () => {
      const mockDoc = {
        id: 'doc-new',
        title: 'Нотатка',
      };

      vi.mocked(documentService.createDocument).mockResolvedValueOnce(
        mockDoc as Awaited<ReturnType<typeof documentService.createDocument>>,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateDocument(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-777',
        title: 'Нотатка',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(documentService.createDocument).toHaveBeenCalledTimes(1);

      expect(documentService.createDocument).toHaveBeenCalledWith('cat-777', {
        title: 'Нотатка',
        categoryId: 'cat-777',
        content: '<h1>New Document</h1><p>Start writing here...</p>',
        visibility: DocumentVisibility.PRIVATE,
      });

      expect(toast.success).toHaveBeenCalledWith(
        'Document created successfully',
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    // 2. Автоматичний перехід до створеного документа
    it('2. Повинен перенаправляти на сторінку нового документа після створення', async () => {
      const mockDoc = {
        id: 'doc-new-999',
        title: 'Свіжа нотатка',
      };

      vi.mocked(documentService.createDocument).mockResolvedValueOnce(
        mockDoc as Awaited<ReturnType<typeof documentService.createDocument>>,
      );

      const { result } = renderHook(() => useCreateDocument(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-123',
        title: 'Свіжа нотатка',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPush).toHaveBeenCalledWith(
        '/workspaces/ws-123/documents/doc-new-999',
      );
    });

    // 3. Помилка створення документа
    it('3. Повинен показувати повідомлення про помилку при невдалому створенні', async () => {
      vi.mocked(documentService.createDocument).mockRejectedValueOnce(
        new Error('Creation failed'),
      );

      const { result } = renderHook(() => useCreateDocument(), { wrapper });

      result.current.mutate({
        categoryId: 'cat-123',
        title: 'Нотатка',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to create document. Please try again.',
      );

      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // useDeleteDocument
  // =====================================================

  describe('useDeleteDocument', () => {
    // 4. Успішне видалення документа
    it('4. Повинен викликати сервіс видалення та інвалідувати кеш структури', async () => {
      vi.mocked(documentService.deleteDocument).mockResolvedValueOnce(
        undefined,
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-active');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(documentService.deleteDocument).toHaveBeenCalledTimes(1);
      expect(documentService.deleteDocument).toHaveBeenCalledWith('doc-active');

      expect(toast.success).toHaveBeenCalledWith(
        'Document deleted successfully',
      );

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    // 5. Редірект після видалення активного документа
    it('5. Повинен перенаправляти на воркспейс після видалення активного документа', async () => {
      vi.mocked(documentService.deleteDocument).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-active');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockPush).toHaveBeenCalledWith('/workspaces/ws-123');
    });

    // 6. Відсутність редіректу після видалення іншого документа
    it('6. Не повинен перенаправляти, якщо видалений документ не є активним', async () => {
      vi.mocked(documentService.deleteDocument).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-other');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(documentService.deleteDocument).toHaveBeenCalledWith('doc-other');

      expect(mockPush).not.toHaveBeenCalled();
    });

    // 7. Помилка видалення документа
    it('7. Повинен показувати повідомлення про помилку при невдалому видаленні', async () => {
      vi.mocked(documentService.deleteDocument).mockRejectedValueOnce(
        new Error('Deletion failed'),
      );

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-active');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(toast.error).toHaveBeenCalledWith('Failed to delete document');

      expect(toast.success).not.toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
