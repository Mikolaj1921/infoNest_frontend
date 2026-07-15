// ua: готові ai тести для кастом хука useAutosaveDocument
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutosaveDocument } from './useAutosaveDocument';
import { documentService } from '@/services/document.service';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { WorkspaceDocument, DocumentVisibility } from '@/types/document';

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: vi.fn(),
  useMutation: vi.fn(({ mutationFn, onSuccess, onError }) => {
    return {
      mutate: async (variables: unknown) => {
        try {
          const data = await mutationFn(variables);
          if (onSuccess) onSuccess(data);
        } catch (error) {
          if (onError) onError(error);
        }
      },
    };
  }),
}));

vi.mock('@/services/document.service', () => ({
  documentService: {
    updateDocument: vi.fn(),
  },
}));

const mockUpdatedDoc: WorkspaceDocument = {
  id: 'doc_123',
  title: 'Updated Title',
  content: '<p>Updated content</p>',
  categoryId: 'cat_1',
  ownerId: 'usr_1',
  visibility: DocumentVisibility.PRIVATE,
  createdAt: '2026-06-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

describe('Custom Hook: useAutosaveDocument', () => {
  const mockSetQueryData = vi.fn();
  const mockQueryClient = {
    setQueryData: mockSetQueryData,
  } as unknown as QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  test('1. Успішне фонове оновлення локального кешу через setQueryData без виклику invalidateQueries', async () => {
    vi.mocked(documentService.updateDocument).mockResolvedValueOnce(
      mockUpdatedDoc,
    );
    const onSuccessCb = vi.fn();

    const { result } = renderHook(() =>
      useAutosaveDocument('doc_123', { onSuccessCb }),
    );

    await act(async () => {
      await result.current.mutate({
        dto: { content: '<p>Updated content</p>' },
      });
    });

    expect(documentService.updateDocument).toHaveBeenCalledWith(
      'doc_123',
      { content: '<p>Updated content</p>' },
      undefined,
    );
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ['document', 'doc_123'],
      mockUpdatedDoc,
    );
    expect(onSuccessCb).toHaveBeenCalledWith(mockUpdatedDoc);
  });

  test("2. М'яке ігнорування помилки скасування CanceledError для запобігання хибних червоних статусів в UI", async () => {
    const cancelError = new Error('Request canceled');
    cancelError.name = 'CanceledError';
    vi.mocked(documentService.updateDocument).mockRejectedValueOnce(
      cancelError,
    );

    const onErrorCb = vi.fn();
    const { result } = renderHook(() =>
      useAutosaveDocument('doc_123', { onErrorCb }),
    );

    await act(async () => {
      await result.current.mutate({ dto: { content: 'test' } });
    });

    expect(onErrorCb).not.toHaveBeenCalled();
    expect(mockSetQueryData).not.toHaveBeenCalled();
  });
});
