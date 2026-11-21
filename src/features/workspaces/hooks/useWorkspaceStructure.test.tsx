import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWorkspaceStructure } from './useWorkspaceStructure';
import { documentService } from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';

// ua: Мок сервісу документів
vi.mock('@/services/document.service', () => ({
  documentService: {
    getWorkspaceStructure: vi.fn(),
  },
}));

// ua: Мок глобального обробника помилок
vi.mock('@/utils/error-handler', () => ({
  handleGlobalError: vi.fn(),
}));

// ua: Створення ізольованого QueryClient для кожного тесту
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

describe('useWorkspaceStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ua: 1. Успішне отримання структури workspace
  it('1. Повинен успішно отримувати структуру workspace', async () => {
    const structure = [
      {
        id: 'category-1',
        name: 'General',
        documents: [
          {
            id: 'doc-1',
            title: 'First document',
          },
        ],
      },
    ];

    vi.mocked(documentService.getWorkspaceStructure).mockResolvedValue(
      structure as Awaited<
        ReturnType<typeof documentService.getWorkspaceStructure>
      >,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(documentService.getWorkspaceStructure).toHaveBeenCalledTimes(1);
    expect(documentService.getWorkspaceStructure).toHaveBeenCalledWith(
      'workspace-123',
    );
    expect(result.current.data).toEqual(structure);
  });

  // ua: 2. Перевірка стану завантаження
  it('2. Повинен повертати стан завантаження під час отримання структури', () => {
    vi.mocked(documentService.getWorkspaceStructure).mockReturnValue(
      new Promise(() => {}),
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    expect(result.current.isPending).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    expect(documentService.getWorkspaceStructure).toHaveBeenCalledWith(
      'workspace-123',
    );
  });

  // ua: 3. Порожній workspaceId повинен блокувати запит
  it('3. Не повинен виконувати запит, якщо workspaceId порожній', () => {
    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useWorkspaceStructure(''), { wrapper });

    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(documentService.getWorkspaceStructure).not.toHaveBeenCalled();
  });

  // ua: 4. Обробка помилки отримання структури
  it('4. Повинен повертати помилку, якщо запит завершився невдало', async () => {
    const error = new Error('Failed to fetch workspace structure');

    vi.mocked(documentService.getWorkspaceStructure).mockRejectedValue(error);

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.data).toBeUndefined();
  });

  // ua: 5. Передавання помилки до глобального обробника
  it('5. Повинен викликати handleGlobalError при помилці запиту', async () => {
    const error = new Error('Workspace structure error');

    vi.mocked(documentService.getWorkspaceStructure).mockRejectedValue(error);

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    await waitFor(() => {
      expect(handleGlobalError).toHaveBeenCalledWith(error);
    });

    expect(handleGlobalError).toHaveBeenCalledTimes(1);
  });

  // ua: 6. Повернення порожньої структури workspace
  it('6. Повинен коректно повертати порожній список категорій', async () => {
    vi.mocked(documentService.getWorkspaceStructure).mockResolvedValue(
      [] as Awaited<ReturnType<typeof documentService.getWorkspaceStructure>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.data).toHaveLength(0);
  });

  // ua: 7. Використання кешованої структури workspace
  it('7. Повинен використовувати кешовану структуру workspace', () => {
    const cachedStructure = [
      {
        id: 'category-cached',
        name: 'Cached category',
        documents: [],
      },
    ];

    const { wrapper, queryClient } = createWrapper();

    queryClient.setQueryData(
      ['workspace-structure', 'workspace-123'],
      cachedStructure,
    );

    const { result } = renderHook(
      () => useWorkspaceStructure('workspace-123'),
      { wrapper },
    );

    expect(result.current.data).toEqual(cachedStructure);
    expect(result.current.isSuccess).toBe(true);
    expect(documentService.getWorkspaceStructure).not.toHaveBeenCalled();
  });

  // ua: 8. Новий запит після зміни workspaceId
  it('8. Повинен отримувати нову структуру після зміни workspaceId', async () => {
    const firstStructure = [
      {
        id: 'category-1',
        name: 'First workspace category',
        documents: [],
      },
    ];

    const secondStructure = [
      {
        id: 'category-2',
        name: 'Second workspace category',
        documents: [],
      },
    ];

    vi.mocked(documentService.getWorkspaceStructure)
      .mockResolvedValueOnce(
        firstStructure as unknown as Awaited<
          ReturnType<typeof documentService.getWorkspaceStructure>
        >,
      )
      .mockResolvedValueOnce(
        secondStructure as unknown as Awaited<
          ReturnType<typeof documentService.getWorkspaceStructure>
        >,
      );

    const { wrapper } = createWrapper();

    const { result, rerender } = renderHook(
      ({ workspaceId }: { workspaceId: string }) =>
        useWorkspaceStructure(workspaceId),
      {
        wrapper,
        initialProps: {
          workspaceId: 'workspace-123',
        },
      },
    );

    await waitFor(() => {
      expect(result.current.data).toEqual(firstStructure);
    });

    rerender({ workspaceId: 'workspace-456' });

    await waitFor(() => {
      expect(result.current.data).toEqual(secondStructure);
    });

    expect(documentService.getWorkspaceStructure).toHaveBeenCalledTimes(2);
    expect(documentService.getWorkspaceStructure).toHaveBeenNthCalledWith(
      1,
      'workspace-123',
    );
    expect(documentService.getWorkspaceStructure).toHaveBeenNthCalledWith(
      2,
      'workspace-456',
    );
  });
});
