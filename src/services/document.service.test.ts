import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import api from '@/lib/axios';
import axios from 'axios';
import { documentService } from './document.service';

import { DocumentVisibility } from '@/types/document';

import type {
  WorkspaceDocument,
  WorkspaceCategory,
  DocumentRevision,
} from '@/types/document';

// ua: мок налаштованого екземпляра Axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('documentService', () => {
  const mockDocument = {
    id: 'doc-777',
    title: 'Нова Нотатка',
    content: '<h1>New Document</h1>',
    categoryId: 'cat-123',
    ownerId: 'user-1',
    visibility: DocumentVisibility.PRIVATE,
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  } as WorkspaceDocument;

  const mockCategory = {
    id: 'cat-123',
    name: 'Тестова категорія',
    workspaceId: 'ws-999',
    documents: [mockDocument],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  } as unknown as WorkspaceCategory;

  const mockRevision = {
    id: 'rev-1',
    documentId: 'doc-777',
    content: '<p>Попередня версія</p>',
    createdAt: '2026-01-01T10:00:00.000Z',
    editor: {
      id: 'u-1',
      name: 'Editor 1',
      email: 'editor@test.com',
    },
  } as DocumentRevision;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================
  // GET WORKSPACE STRUCTURE
  // ==========================================

  describe('getWorkspaceStructure', () => {
    // 1. Отримання структури у вигляді масиву
    it('1. Повинен отримувати структуру воркспейсу у вигляді масиву категорій', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [mockCategory],
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/workspaces/ws-999/structure');
      expect(result).toEqual([mockCategory]);
    });

    // 2. Отримання структури через categories
    it('2. Повинен отримувати категорії з вкладеного об’єкта categories', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            categories: [mockCategory],
          },
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([mockCategory]);
    });

    // 3. Отримання структури через structure
    it('3. Повинен отримувати категорії з вкладеного об’єкта structure', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            structure: [mockCategory],
          },
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([mockCategory]);
    });

    // 4. Некоректна відповідь API
    it('4. Повинен повертати порожній масив, якщо success має значення false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([]);
    });

    // 5. Невідома структура відповіді
    it('5. Повинен повертати порожній масив, якщо структура відповіді невідома', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            items: [mockCategory],
          },
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([]);
    });

    // 6. Відсутність data
    it('6. Повинен повертати порожній масив, якщо data відсутнє', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([]);
    });

    // 7. Обробка 404
    it('7. Повинен повертати порожню структуру, якщо бекенд повернув 404', async () => {
      const mockError = {
        response: {
          status: 404,
        },
      };

      vi.spyOn(axios, 'isAxiosError').mockReturnValue(true);
      vi.spyOn(console, 'log').mockImplementation(() => {});

      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      const result = await documentService.getWorkspaceStructure('ws-999');

      expect(result).toEqual([]);
      expect(console.log).toHaveBeenCalled();
    });

    // 8. Інші HTTP-помилки
    it('8. Повинен передавати інші помилки API далі', async () => {
      const mockError = new Error('Server error');

      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await expect(
        documentService.getWorkspaceStructure('ws-999'),
      ).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // GET DOCUMENT BY ID
  // ==========================================

  describe('getDocumentbyId', () => {
    // 9. Успішне отримання документа
    it('9. Повинен отримувати документ за його ID', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            document: mockDocument,
          },
        },
      } as never);

      const result = await documentService.getDocumentbyId('doc-777');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/documents/doc-777');
      expect(result).toEqual(mockDocument);
    });

    // 10. Некоректна відповідь
    it('10. Повинен повертати null, якщо success має значення false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      const result = await documentService.getDocumentbyId('doc-777');

      expect(result).toBeNull();
    });

    // 11. Відсутність документа
    it('11. Повинен повертати null, якщо відповідь не містить document', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      } as never);

      const result = await documentService.getDocumentbyId('doc-777');

      expect(result).toBeNull();
    });

    // 12. HTTP-помилка
    it('12. Повинен передавати помилку API далі', async () => {
      const mockError = new Error('Document not found');

      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await expect(documentService.getDocumentbyId('doc-777')).rejects.toBe(
        mockError,
      );
    });
  });

  // ==========================================
  // UPDATE DOCUMENT
  // ==========================================

  describe('updateDocument', () => {
    const updateDTO = {
      title: 'Оновлений документ',
      content: '<p>Оновлений вміст</p>',
    };

    const updatedDocument = {
      ...mockDocument,
      ...updateDTO,
    };

    // 13. Успішне оновлення
    it('13. Повинен оновлювати документ та повертати оновлені дані', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            document: updatedDocument,
          },
        },
      } as never);

      const result = await documentService.updateDocument('doc-777', updateDTO);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/documents/doc-777', updateDTO, {
        signal: undefined,
      });
      expect(result).toEqual(updatedDocument);
    });

    // 14. Передавання AbortSignal
    it('14. Повинен передавати AbortSignal до Axios-запиту', async () => {
      const controller = new AbortController();

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            document: updatedDocument,
          },
        },
      } as never);

      await documentService.updateDocument(
        'doc-777',
        updateDTO,
        controller.signal,
      );

      expect(api.patch).toHaveBeenCalledWith('/documents/doc-777', updateDTO, {
        signal: controller.signal,
      });
    });

    // 15. Некоректна відповідь
    it('15. Повинен викидати помилку, якщо відповідь не містить документа', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      await expect(
        documentService.updateDocument('doc-777', updateDTO),
      ).rejects.toThrow(
        'Invalid response structure from server during document saving',
      );
    });

    // 16. HTTP-помилка
    it('16. Повинен передавати помилку API під час оновлення документа', async () => {
      const mockError = new Error('Document update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(mockError);

      await expect(
        documentService.updateDocument('doc-777', updateDTO),
      ).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // CREATE DOCUMENT
  // ==========================================

  describe('createDocument', () => {
    const createDTO = {
      title: 'Нова Нотатка',
      content: '<h1>New Document</h1>',
      categoryId: 'cat-123',
      visibility: DocumentVisibility.PRIVATE,
    };

    // 17. Успішне створення документа
    it('17. Повинен створювати документ всередині категорії', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockDocument,
        },
      } as never);

      const result = await documentService.createDocument('cat-123', createDTO);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/documents', {
        ...createDTO,
        categoryId: 'cat-123',
      });
      expect(result).toEqual(mockDocument);
    });

    // 18. Вкладена структура документа
    it('18. Повинен повертати document з вкладеної відповіді API', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            document: mockDocument,
          },
        },
      } as never);

      const result = await documentService.createDocument('cat-123', createDTO);

      expect(result).toEqual(mockDocument);
    });

    // 19. Некоректна відповідь
    it('19. Повинен викидати помилку, якщо відповідь API невалідна', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: null,
      } as never);

      await expect(
        documentService.createDocument('cat-123', createDTO),
      ).rejects.toThrow('Invalid response structure during document creation');
    });

    // 20. HTTP-помилка
    it('20. Повинен передавати помилку API під час створення документа', async () => {
      const mockError = new Error('Document creation failed');

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(
        documentService.createDocument('cat-123', createDTO),
      ).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // DELETE DOCUMENT
  // ==========================================

  describe('deleteDocument', () => {
    // 21. Успішне видалення
    it('21. Повинен видаляти документ за його ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        status: 204,
      } as never);

      const result = await documentService.deleteDocument('doc-777');

      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith('/documents/doc-777');
      expect(result).toBeUndefined();
    });

    // 22. HTTP-помилка
    it('22. Повинен передавати помилку API під час видалення документа', async () => {
      const mockError = new Error('Document deletion failed');

      vi.mocked(api.delete).mockRejectedValueOnce(mockError);

      await expect(documentService.deleteDocument('doc-777')).rejects.toBe(
        mockError,
      );
    });
  });

  // ==========================================
  // GET DOCUMENT REVISIONS
  // ==========================================

  describe('getDocumentRevisions', () => {
    // 23. Отримання ревізій у вигляді масиву
    it('23. Повинен повертати масив ревізій документа', async () => {
      const mockRevisions = [mockRevision];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockRevisions,
        },
      } as never);

      const result = await documentService.getDocumentRevisions('doc-777');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/documents/doc-777/revisions');
      expect(result).toEqual(mockRevisions);
    });

    // 24. Отримання ревізій через вкладений об'єкт
    it('24. Повинен повертати revisions з вкладеного об’єкта data', async () => {
      const mockRevisions = [mockRevision];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            revisions: mockRevisions,
          },
        },
      } as never);

      const result = await documentService.getDocumentRevisions('doc-777');

      expect(result).toEqual(mockRevisions);
    });

    // 25. Некоректна відповідь
    it('25. Повинен повертати порожній масив, якщо success має значення false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      const result = await documentService.getDocumentRevisions('doc-777');

      expect(result).toEqual([]);
    });

    // 26. Невідома структура ревізій
    it('26. Повинен повертати порожній масив, якщо структура ревізій невідома', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            items: [mockRevision],
          },
        },
      } as never);

      const result = await documentService.getDocumentRevisions('doc-777');

      expect(result).toEqual([]);
    });

    // 27. Відсутність data
    it('27. Повинен повертати порожній масив, якщо data відсутнє', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      const result = await documentService.getDocumentRevisions('doc-777');

      expect(result).toEqual([]);
    });

    // 28. HTTP-помилка
    it('28. Повинен передавати помилку API під час отримання ревізій', async () => {
      const mockError = new Error('Revisions loading failed');

      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await expect(
        documentService.getDocumentRevisions('doc-777'),
      ).rejects.toBe(mockError);
    });
  });
});
