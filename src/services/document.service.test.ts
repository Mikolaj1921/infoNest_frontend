// ua: тест для сервісу документів - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { documentService } from './document.service';
import { DocumentVisibility } from '@/types/document';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('documentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDocument', () => {
    it('має успішно створити документ всередині категорії', async () => {
      const mockDocument = {
        id: 'doc-777',
        title: 'Нова Нотатка',
        content: '<h1>New Document</h1>',
        categoryId: 'cat-123',
        ownerId: 'user-1',
        visibility: DocumentVisibility.PRIVATE,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      const dto = {
        title: 'Нова Нотатка',
        categoryId: 'cat-123',
        content: '<h1>New Document</h1>',
        visibility: DocumentVisibility.PRIVATE,
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        status: 201,
        data: {
          success: true,
          data: mockDocument,
        },
      });

      const result = await documentService.createDocument('cat-123', dto);

      expect(api.post).toHaveBeenCalledWith(
        '/categories/cat-123/documents',
        dto,
      );
      expect(result).toEqual(mockDocument);
    });

    it('має викинути помилку, якщо сервер повернув некоректну відповідь структури', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        status: 201,
        data: null,
      });

      await expect(
        documentService.createDocument('cat-123', {
          title: 'Тест',
          categoryId: 'cat-123',
          content: '',
          visibility: DocumentVisibility.PRIVATE,
        }),
      ).rejects.toThrow('Invalid response structure during document creation');
    });
  });

  describe('deleteDocument', () => {
    it('має надіслати DELETE запит для видалення нотатки за її ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 });

      await documentService.deleteDocument('doc-777');

      expect(api.delete).toHaveBeenCalledWith('/documents/doc-777');
    });
  });

  describe('getDocumentRevisions', () => {
    it('має успішно повернути масив ревізій документа при коді 200', async () => {
      const mockRevisions = [
        {
          id: 'rev-1',
          documentId: 'doc-123',
          content: '<p>v1</p>',
          createdAt: '2026-01-01T10:00:00.000Z',
          editor: { id: 'u-1', name: 'Editor 1', email: 'ed@test.com' },
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          data: mockRevisions,
        },
      });

      const result = await documentService.getDocumentRevisions('doc-123');

      expect(api.get).toHaveBeenCalledWith('/documents/doc-123/revisions');
      expect(result).toEqual(mockRevisions);
    });

    it('має викинути помилку, якщо success має значення false або структура невалідна', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        status: 200,
        data: { success: false, data: null },
      });

      await expect(
        documentService.getDocumentRevisions('doc-123'),
      ).rejects.toThrow(
        'Invalid response structure during fetching document revisions',
      );
    });
  });
});
