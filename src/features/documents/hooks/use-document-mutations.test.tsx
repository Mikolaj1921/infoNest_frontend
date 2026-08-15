// ua: Тестування хуків useCreateDocument та useDeleteDocument - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateDocument, useDeleteDocument } from './use-document-mutations';
import { documentService } from '@/services/document.service';
import { DocumentVisibility, WorkspaceDocument } from '@/types/document';
import { toast } from 'sonner';
import * as navigation from 'next/navigation';
import React from 'react';

// ua: глобальні заглушки для сервісів та тостера
vi.mock('@/services/document.service', () => ({
  documentService: {
    createDocument: vi.fn(),
    deleteDocument: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ua: мок навігації на верхньому рівні для уникнення require()
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
  useParams: vi.fn(() => ({ id: 'ws-123', docId: 'doc-active' })),
}));

describe('Document Mutations Hooks', () => {
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

  describe('useCreateDocument', () => {
    it('має викликати інвалідацію кешу structures після створення документа', async () => {
      const mockDoc = { id: 'doc-new', title: 'Нотатка' };

      vi.mocked(documentService.createDocument).mockResolvedValueOnce(
        mockDoc as unknown as WorkspaceDocument,
      );
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateDocument(), { wrapper });

      result.current.mutate({ categoryId: 'cat-777', title: 'Нотатка' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

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

    it('має автоматично редіректити на сторінку нового документа після його успішного створення', async () => {
      const mockPush = vi.fn();

      vi.spyOn(navigation, 'useRouter').mockImplementation(() => ({
        push: mockPush,
        replace: vi.fn(),
        forward: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
        refresh: vi.fn(),
      }));

      const mockDoc = { id: 'doc-new-999', title: 'Свіжа нотатка' };
      vi.mocked(documentService.createDocument).mockResolvedValueOnce(
        mockDoc as unknown as WorkspaceDocument,
      );

      const { result } = renderHook(() => useCreateDocument(), { wrapper });

      result.current.mutate({ categoryId: 'cat-123', title: 'Свіжа нотатка' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPush).toHaveBeenCalledWith(
        '/workspaces/ws-123/documents/doc-new-999',
      );
    });
  });

  describe('useDeleteDocument', () => {
    it('має успішно викликати сервіс видалення та очистити кеш', async () => {
      vi.mocked(documentService.deleteDocument).mockResolvedValueOnce(
        undefined,
      );
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-active');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(documentService.deleteDocument).toHaveBeenCalledWith('doc-active');
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['workspace-structure', 'ws-123'],
      });
    });

    it('має автоматично редіректити на воркспейс, якщо користувач видалив документ, у якому він зараз перебуває', async () => {
      const mockPush = vi.fn();

      vi.spyOn(navigation, 'useRouter').mockImplementation(() => ({
        push: mockPush,
        replace: vi.fn(),
        forward: vi.fn(),
        back: vi.fn(),
        prefetch: vi.fn(),
        refresh: vi.fn(),
      }));

      vi.mocked(documentService.deleteDocument).mockResolvedValueOnce(
        undefined,
      );

      const { result } = renderHook(() => useDeleteDocument(), { wrapper });

      result.current.mutate('doc-active');

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockPush).toHaveBeenCalledWith('/workspaces/ws-123');
    });
  });
});
