// ai tests - file service tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { fileService } from './file.service';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Service: fileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDocumentFiles', () => {
    it('1. Має успішно повернути масив файлів при коді відповіді 200', async () => {
      const mockFiles = [
        {
          id: 'file-1',
          documentId: 'doc-123',
          ownerId: 'user-1',
          fileName: 'report.pdf',
          url: 'http://cloudflare.com',
          size: 1024,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(api.get).mockResolvedValueOnce({
        status: 200,
        data: {
          success: true,
          data: mockFiles,
        },
      });

      const result = await fileService.getDocumentFiles('doc-123');

      expect(api.get).toHaveBeenCalledWith('/documents/doc-123/files');
      expect(result).toEqual(mockFiles);
    });

    it('2. Має безпечно повернути порожній масив [], якщо бекенд видав помилку 404', async () => {
      // Імітуємо AxiosError з кодом 404
      const mockAxiosError = {
        isAxiosError: true,
        response: { status: 404 },
      };

      vi.mocked(api.get).mockRejectedValueOnce(mockAxiosError);

      const result = await fileService.getDocumentFiles('doc-123');

      expect(api.get).toHaveBeenCalledWith('/documents/doc-123/files');
      expect(result).toEqual([]); // перевіряємо захисне гасіння помилки
    });
  });

  describe('deleteFile', () => {
    it('3. Має надіслати точний DELETE запит для видалення файлу за його ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 });

      await fileService.deleteFile('file-999');

      expect(api.delete).toHaveBeenCalledWith('/files/file-999');
    });
  });

  describe('uploadFile', () => {
    it('4. Має успішно провести завантаження файлу та повернути об’єкт FileAttachment', async () => {
      const testFile = new File(['dummy content'], 'test.png', {
        type: 'image/png',
      });
      const progressCallback = vi.fn();

      const uploadPromise = fileService.uploadFile(
        'doc-123',
        testFile,
        progressCallback,
      );

      // Оскільки у нас зараз стоїть імітація таймером (setInterval), чекаємо завершення промісу
      const result = await uploadPromise;

      expect(result.documentId).toBe('doc-123');
      expect(result.fileName).toBe('test.png');
      expect(progressCallback).toHaveBeenCalled();
    });
  });
});
