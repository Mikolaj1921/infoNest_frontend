// ai tests - тести для хука useDocumentRevisions - історія док

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDocumentRevisions } from './useDocumentRevisions';
import { documentService } from '@/services/document.service';
import { DocumentRevision } from '@/types/document';
import React from 'react';

vi.mock('@/services/document.service', () => ({
  documentService: {
    getDocumentRevisions: vi.fn(),
  },
}));

describe('useDocumentRevisions Hook', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('за замовчуванням має бути вимкненим (enabled: false) і запускатися тільки через refetch', async () => {
    const mockRevisions: DocumentRevision[] = [
      {
        id: 'rev-1',
        documentId: 'doc-123',
        content: '<p>Test</p>',
        createdAt: '2026-01-01T12:00:00.000Z',
        editor: { id: 'u-1', name: 'User', email: 'user@test.com' },
      },
    ];
    vi.mocked(documentService.getDocumentRevisions).mockResolvedValueOnce(
      mockRevisions,
    );

    const { result } = renderHook(() => useDocumentRevisions('doc-123'), {
      wrapper,
    });

    // ua: Перевіряємо, що запит не пішов автоматично при монтуванні
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isFetched).toBe(false);
    expect(documentService.getDocumentRevisions).not.toHaveBeenCalled();

    // Тригеримо запит вручну
    result.current.refetch();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(documentService.getDocumentRevisions).toHaveBeenCalledWith(
      'doc-123',
    );
    expect(result.current.data).toEqual(mockRevisions);
  });
});
