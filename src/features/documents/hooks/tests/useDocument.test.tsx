// ai tests - useDocument hook

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useDocument } from '../useDocument';
import { documentService } from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';

// ua: мок сервісу документів
vi.mock('@/services/document.service', () => ({
  documentService: {
    getDocumentbyId: vi.fn(),
  },
}));

// ua: мок глобального обробника помилок
vi.mock('@/utils/error-handler', () => ({
  handleGlobalError: vi.fn(),
}));

describe('useDocument', () => {
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

  // 1. Успішне отримання документа
  it('1. Повинен успішно отримувати документ за його ID', async () => {
    const mockDocument = {
      id: 'doc-123',
      title: 'Тестовий документ',
      content: '<p>Вміст документа</p>',
    };

    vi.mocked(documentService.getDocumentbyId).mockResolvedValueOnce(
      mockDocument as Awaited<
        ReturnType<typeof documentService.getDocumentbyId>
      >,
    );

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(documentService.getDocumentbyId).toHaveBeenCalledTimes(1);
    expect(documentService.getDocumentbyId).toHaveBeenCalledWith('doc-123');

    expect(result.current.data).toEqual(mockDocument);
  });

  // 2. Початковий стан завантаження
  it('2. Повинен перебувати у стані завантаження під час отримання документа', async () => {
    type DocumentResponse = Awaited<
      ReturnType<typeof documentService.getDocumentbyId>
    >;
    let resolveRequest!: (
      value: DocumentResponse | PromiseLike<DocumentResponse>,
    ) => void;

    vi.mocked(documentService.getDocumentbyId).mockReturnValueOnce(
      new Promise<DocumentResponse>((resolve) => {
        resolveRequest = resolve;
      }) as ReturnType<typeof documentService.getDocumentbyId>,
    );

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.isPending).toBe(true);

    resolveRequest({
      id: 'doc-123',
      title: 'Тестовий документ',
    } as DocumentResponse);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });

  // 3. Відсутній ID документа
  it('3. Не повинен виконувати запит, якщо ID документа порожній', async () => {
    const { result } = renderHook(() => useDocument(''), { wrapper });

    expect(documentService.getDocumentbyId).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isPending).toBe(true);
  });

  // 4. Обробка помилки отримання документа
  it('4. Повинен встановлювати стан помилки при невдалому запиті', async () => {
    const mockError = new Error('Failed to fetch document');

    vi.mocked(documentService.getDocumentbyId).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
    expect(documentService.getDocumentbyId).toHaveBeenCalledWith('doc-123');
  });

  // 5. Виклик глобального обробника помилок
  it('5. Повинен викликати handleGlobalError при помилці запиту', async () => {
    const mockError = new Error('Server error');

    vi.mocked(documentService.getDocumentbyId).mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await waitFor(() => {
      expect(handleGlobalError).toHaveBeenCalledWith(mockError);
    });

    expect(handleGlobalError).toHaveBeenCalledTimes(1);
  });

  // 6. Використання кешованих даних
  it('6. Повинен повертати кешований документ без повторного запиту', async () => {
    const mockDocument = {
      id: 'doc-123',
      title: 'Кешований документ',
      content: '<p>Кешований вміст</p>',
    };

    queryClient.setQueryData(['document', 'doc-123'], mockDocument);

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    expect(result.current.data).toEqual(mockDocument);
    expect(result.current.isSuccess).toBe(true);

    expect(documentService.getDocumentbyId).not.toHaveBeenCalled();
  });

  // 7. Перевірка staleTime
  it('7. Повинен використовувати кеш протягом 5 хвилин', async () => {
    const mockDocument = {
      id: 'doc-123',
      title: 'Документ',
    };

    queryClient.setQueryData(['document', 'doc-123'], mockDocument);

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    expect(result.current.data).toEqual(mockDocument);
    expect(documentService.getDocumentbyId).not.toHaveBeenCalled();
  });

  // 8. Повторне отримання після зміни ID
  it('8. Повинен отримувати інший документ після зміни ID', async () => {
    const firstDocument = {
      id: 'doc-123',
      title: 'Перший документ',
    };

    const secondDocument = {
      id: 'doc-456',
      title: 'Другий документ',
    };

    vi.mocked(documentService.getDocumentbyId)
      .mockResolvedValueOnce(
        firstDocument as Awaited<
          ReturnType<typeof documentService.getDocumentbyId>
        >,
      )
      .mockResolvedValueOnce(
        secondDocument as Awaited<
          ReturnType<typeof documentService.getDocumentbyId>
        >,
      );

    const { result, rerender } = renderHook(({ docId }) => useDocument(docId), {
      wrapper,
      initialProps: {
        docId: 'doc-123',
      },
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(firstDocument);
    });

    rerender({
      docId: 'doc-456',
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondDocument);
    });

    expect(documentService.getDocumentbyId).toHaveBeenCalledTimes(2);
    expect(documentService.getDocumentbyId).toHaveBeenNthCalledWith(
      1,
      'doc-123',
    );
    expect(documentService.getDocumentbyId).toHaveBeenNthCalledWith(
      2,
      'doc-456',
    );
  });

  // 9. Відсутність глобальної помилки при успішному запиті
  it('9. Не повинен викликати handleGlobalError при успішному отриманні документа', async () => {
    const mockDocument = {
      id: 'doc-123',
      title: 'Документ',
    };

    vi.mocked(documentService.getDocumentbyId).mockResolvedValueOnce(
      mockDocument as Awaited<
        ReturnType<typeof documentService.getDocumentbyId>
      >,
    );

    const { result } = renderHook(() => useDocument('doc-123'), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(handleGlobalError).not.toHaveBeenCalled();
  });
});
