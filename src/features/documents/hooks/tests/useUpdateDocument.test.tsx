import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

import { useUpdateDocument } from '../useUpdateDocument';
import {
  documentService,
  type UpdateDocumentDTO,
} from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';

// ua: Мок сервісу документів
vi.mock('@/services/document.service', () => ({
  documentService: {
    updateDocument: vi.fn(),
  },
}));

// ua: Мок глобального обробника помилок
vi.mock('@/utils/error-handler', () => ({
  handleGlobalError: vi.fn(),
}));

// ua: Мок toast-повідомлень
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// ua: Створення ізольованого QueryClient для кожного тесту
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe('useUpdateDocument', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ua: 1. Успішне оновлення документа
  // ua: 1. Успішне оновлення документа
  it('1. Повинен успішно оновлювати документ через documentService', async () => {
    const updatedDocument = {
      id: 'doc-123',
      content: '<h1>Updated document</h1>',
    };

    const dto = {
      content: '<h1>Updated document</h1>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockResolvedValue(
      updatedDocument as Awaited<
        ReturnType<typeof documentService.updateDocument>
      >,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateDocument('doc-123'), {
      wrapper,
    });

    let response!: Awaited<ReturnType<typeof documentService.updateDocument>>;

    await act(async () => {
      response = await result.current.mutateAsync(dto);
    });

    expect(response).toEqual(updatedDocument);

    expect(documentService.updateDocument).toHaveBeenCalledTimes(1);
    expect(documentService.updateDocument).toHaveBeenCalledWith('doc-123', dto);
  });

  // ua: 2. Інвалідація кешу структури workspace та конкретного документа
  it('2. Повинен інвалідувати кеш структури workspace та документа після збереження', async () => {
    const dto = {
      content: '<p>Updated content</p>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockResolvedValue(
      {} as Awaited<ReturnType<typeof documentService.updateDocument>>,
    );

    const { wrapper, queryClient } = createWrapper();

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateDocument('doc-123'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['workspace-structure'],
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['document', 'doc-123'],
    });

    expect(invalidateSpy).toHaveBeenCalledTimes(2);
  });

  // ua: 3. Повідомлення про успішне збереження за замовчуванням
  it('3. Повинен показувати success toast після успішного збереження', async () => {
    const dto = {
      content: '<p>Saved content</p>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockResolvedValue(
      {} as Awaited<ReturnType<typeof documentService.updateDocument>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateDocument('doc-123'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    expect(toast.success).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Changes saved successfully');
  });

  // ua: 4. Можливість вимкнути success toast
  it('4. Не повинен показувати success toast, якщо showToast дорівнює false', async () => {
    const dto = {
      content: '<p>Saved silently</p>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockResolvedValue(
      {} as Awaited<ReturnType<typeof documentService.updateDocument>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useUpdateDocument('doc-123', { showToast: false }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    expect(toast.success).not.toHaveBeenCalled();
  });

  // ua: 5. Виклик callback після успішного збереження
  it('5. Повинен викликати onSuccessCb після успішного збереження', async () => {
    const dto = {
      content: '<p>Saved content</p>',
    } as UpdateDocumentDTO;

    const onSuccessCb = vi.fn();

    vi.mocked(documentService.updateDocument).mockResolvedValue(
      {} as Awaited<ReturnType<typeof documentService.updateDocument>>,
    );

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useUpdateDocument('doc-123', { onSuccessCb }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    expect(onSuccessCb).toHaveBeenCalledTimes(1);
  });

  // ua: 6. Обробка помилки оновлення документа
  it('6. Повинен передавати помилку до handleGlobalError', async () => {
    const error = new Error('Failed to update document');

    const dto = {
      content: '<p>Content</p>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockRejectedValue(error);

    const { wrapper } = createWrapper();

    const { result } = renderHook(() => useUpdateDocument('doc-123'), {
      wrapper,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(dto)).rejects.toThrow(
        'Failed to update document',
      );
    });

    expect(handleGlobalError).toHaveBeenCalledTimes(1);
    expect(handleGlobalError).toHaveBeenCalledWith(error);
    expect(result.current.isError).toBe(true);
    expect(toast.success).not.toHaveBeenCalled();
  });

  // ua: 7. Callback не повинен викликатися при помилці
  it('7. Не повинен викликати onSuccessCb, якщо оновлення завершилося помилкою', async () => {
    const error = new Error('Update failed');
    const onSuccessCb = vi.fn();

    const dto = {
      content: '<p>Content</p>',
    } as UpdateDocumentDTO;

    vi.mocked(documentService.updateDocument).mockRejectedValue(error);

    const { wrapper } = createWrapper();

    const { result } = renderHook(
      () => useUpdateDocument('doc-123', { onSuccessCb }),
      { wrapper },
    );

    await act(async () => {
      await expect(result.current.mutateAsync(dto)).rejects.toThrow(
        'Update failed',
      );
    });

    expect(onSuccessCb).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
