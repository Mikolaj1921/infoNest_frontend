// ai tests - useDocumentFiles hook

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useDocumentFiles } from '../useDocumentFiles';
import { fileService } from '@/services/file.service';

// ua: Мок сервісу файлів
vi.mock('@/services/file.service', () => ({
  fileService: {
    getDocumentFiles: vi.fn(),
  },
}));

// ua: Створення QueryClient для ізольованого тестування кожного сценарію
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('useDocumentFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ua: 1. Успішне отримання списку файлів
  it('1. Повинен успішно отримувати файли документа', async () => {
    const files = [
      {
        id: 'file-1',
        fileName: 'document.pdf',
        url: 'https://example.com/document.pdf',
      },
      {
        id: 'file-2',
        fileName: 'image.png',
        url: 'https://example.com/image.png',
      },
    ];

    vi.mocked(fileService.getDocumentFiles).mockResolvedValue(
      files as Awaited<ReturnType<typeof fileService.getDocumentFiles>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(fileService.getDocumentFiles).toHaveBeenCalledTimes(1);
    expect(fileService.getDocumentFiles).toHaveBeenCalledWith('doc-123');
    expect(result.current.data).toEqual(files);
  });

  // ua: 2. Перевірка початкового стану завантаження
  it('2. Повинен повертати стан завантаження під час отримання файлів', () => {
    vi.mocked(fileService.getDocumentFiles).mockReturnValue(
      new Promise(() => {}),
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    expect(fileService.getDocumentFiles).toHaveBeenCalledWith('doc-123');
  });

  // ua: 3. Порожній documentId powinien blokować zapytanie
  it('3. Не повинен відправляти запит, якщо documentId порожній', () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDocumentFiles(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(fileService.getDocumentFiles).not.toHaveBeenCalled();
  });

  // ua: 4. Обробка помилки отримання файлів
  it('4. Повинен повертати помилку, якщо запит завершився невдало', async () => {
    const error = new Error('Failed to fetch document files');

    vi.mocked(fileService.getDocumentFiles).mockRejectedValue(error);

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });

  // ua: 5. Повернення порожнього списку файлів
  it('5. Повинен коректно повертати порожній список файлів', async () => {
    vi.mocked(fileService.getDocumentFiles).mockResolvedValue(
      [] as Awaited<ReturnType<typeof fileService.getDocumentFiles>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });

  // ua: 6. Перевірка використання кешованих даних
  it('6. Повинен використовувати кешовані файли документа', async () => {
    const cachedFiles = [
      {
        id: 'file-cached',
        fileName: 'cached.pdf',
        url: 'https://example.com/cached.pdf',
      },
    ];

    const { wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(['document-files', 'doc-123'], cachedFiles);

    const { result } = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    expect(result.current.data).toEqual(cachedFiles);
    expect(fileService.getDocumentFiles).not.toHaveBeenCalled();
  });

  // ua: 7. Повторне отримання файлів для іншого документа
  it('7. Повинен виконувати новий запит після зміни documentId', async () => {
    const firstDocumentFiles = [
      {
        id: 'file-1',
        fileName: 'first.pdf',
        url: 'https://example.com/first.pdf',
      },
    ];

    const secondDocumentFiles = [
      {
        id: 'file-2',
        fileName: 'second.pdf',
        url: 'https://example.com/second.pdf',
      },
    ];

    vi.mocked(fileService.getDocumentFiles)
      .mockResolvedValueOnce(
        firstDocumentFiles as Awaited<
          ReturnType<typeof fileService.getDocumentFiles>
        >,
      )
      .mockResolvedValueOnce(
        secondDocumentFiles as Awaited<
          ReturnType<typeof fileService.getDocumentFiles>
        >,
      );

    const { wrapper } = createWrapper();

    const { result, rerender } = renderHook(
      ({ documentId }: { documentId: string }) => useDocumentFiles(documentId),
      {
        wrapper,
        initialProps: {
          documentId: 'doc-123',
        },
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstDocumentFiles);
    });

    rerender({ documentId: 'doc-456' });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondDocumentFiles);
    });

    expect(fileService.getDocumentFiles).toHaveBeenCalledTimes(2);
    expect(fileService.getDocumentFiles).toHaveBeenNthCalledWith(1, 'doc-123');
    expect(fileService.getDocumentFiles).toHaveBeenNthCalledWith(2, 'doc-456');
  });

  // ua: 8. Перевірка повторного використання свіжих кешованих даних
  it('8. Не повинен повторно запитувати файли, якщо кеш ще актуальний', async () => {
    const files = [
      {
        id: 'file-1',
        fileName: 'document.pdf',
        url: 'https://example.com/document.pdf',
      },
    ];

    vi.mocked(fileService.getDocumentFiles).mockResolvedValue(
      files as Awaited<ReturnType<typeof fileService.getDocumentFiles>>,
    );

    const { wrapper } = createWrapper();

    const firstHook = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    await waitFor(() => {
      expect(firstHook.result.current.isSuccess).toBe(true);
    });

    firstHook.unmount();

    const secondHook = renderHook(() => useDocumentFiles('doc-123'), {
      wrapper,
    });

    expect(secondHook.result.current.data).toEqual(files);
    expect(fileService.getDocumentFiles).toHaveBeenCalledTimes(1);
  });
});
