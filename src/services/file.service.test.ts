// ai tests - file service

import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { fileService } from './file.service';

import type { FileAttachment } from '@/types/document';

// ua: мок налаштованого екземпляра Axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('fileService', () => {
  const mockFileAttachment = {
    id: 'file-123',
    documentId: 'doc-777',
    name: 'document.pdf',
    url: 'https://example.com/document.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    createdAt: '2026-01-01',
  } as unknown as FileAttachment;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // GET DOCUMENT FILES
  // ==========================================

  describe('getDocumentFiles', () => {
    // 1. Успішне отримання файлів
    it('1. Повинен отримувати список файлів документа', async () => {
      const mockFiles = [mockFileAttachment];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockFiles,
        },
      } as never);

      const result = await fileService.getDocumentFiles('doc-777');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/documents/doc-777/files');
      expect(result).toEqual(mockFiles);
    });

    // 2. Повернення порожнього списку
    it('2. Повинен повертати порожній масив, якщо документ не має файлів', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      } as never);

      const result = await fileService.getDocumentFiles('doc-777');

      expect(result).toEqual([]);
    });

    // 3. Некоректний success
    it('3. Повинен викидати помилку, якщо success має значення false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: [],
        },
      } as never);

      await expect(fileService.getDocumentFiles('doc-777')).rejects.toThrow(
        'Invalid response while loading document files',
      );
    });

    // 4. Некоректна структура data
    it('4. Повинен викидати помилку, якщо data не є масивом', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      await expect(fileService.getDocumentFiles('doc-777')).rejects.toThrow(
        'Invalid response while loading document files',
      );
    });

    // 5. Відсутність відповіді
    it('5. Повинен викидати помилку, якщо API повертає некоректну відповідь', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: null,
      } as never);

      await expect(fileService.getDocumentFiles('doc-777')).rejects.toThrow(
        'Invalid response while loading document files',
      );
    });

    // 6. HTTP-помилка
    it('6. Повинен передавати помилку API під час отримання файлів', async () => {
      const mockError = new Error('Files loading failed');

      vi.mocked(api.get).mockRejectedValueOnce(mockError);

      await expect(fileService.getDocumentFiles('doc-777')).rejects.toBe(
        mockError,
      );
    });
  });

  // ==========================================
  // DELETE FILE
  // ==========================================

  describe('deleteFile', () => {
    // 7. Успішне видалення файлу
    it('7. Повинен видаляти файл за його ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        status: 204,
      } as never);

      const result = await fileService.deleteFile('file-123');

      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith('/files/file-123');
      expect(result).toBeUndefined();
    });

    // 8. HTTP-помилка
    it('8. Повинен передавати помилку API під час видалення файлу', async () => {
      const mockError = new Error('File deletion failed');

      vi.mocked(api.delete).mockRejectedValueOnce(mockError);

      await expect(fileService.deleteFile('file-123')).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // UPLOAD FILE
  // ==========================================

  describe('uploadFile', () => {
    const createMockFile = () =>
      new File(['test file content'], 'document.pdf', {
        type: 'application/pdf',
      });

    // 9. Успішне завантаження
    it('9. Повинен завантажувати файл до документа та повертати його дані', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            file: mockFileAttachment,
          },
        },
      } as never);

      const result = await fileService.uploadFile('doc-777', file, onProgress);

      expect(api.post).toHaveBeenCalledTimes(1);

      const [url, formData, config] = vi.mocked(api.post).mock.calls[0];

      expect(url).toBe('/files/document/doc-777');
      expect(formData).toBeInstanceOf(FormData);
      expect((formData as FormData).get('file')).toBe(file);
      expect(config).toHaveProperty('onUploadProgress');

      expect(result).toEqual(mockFileAttachment);
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });

    // 10. Виклик onUploadProgress
    it('10. Повинен обчислювати та передавати відсоток завантаження', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockImplementationOnce(
        async (_url, _formData, config) => {
          config?.onUploadProgress?.({
            loaded: 50,
            total: 100,
          } as never);

          return {
            data: {
              success: true,
              data: {
                file: mockFileAttachment,
              },
            },
          } as never;
        },
      );

      await fileService.uploadFile('doc-777', file, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });

    // 11. Використання file.size, якщо total відсутній
    it('11. Повинен використовувати розмір файлу, якщо total не переданий', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockImplementationOnce(
        async (_url, _formData, config) => {
          config?.onUploadProgress?.({
            loaded: file.size / 2,
            total: undefined,
          } as never);

          return {
            data: {
              success: true,
              data: {
                file: mockFileAttachment,
              },
            },
          } as never;
        },
      );

      await fileService.uploadFile('doc-777', file, onProgress);

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(onProgress).toHaveBeenLastCalledWith(100);
    });

    // 12. Обмеження відсотка до 100
    it('12. Не повинен передавати відсоток завантаження більший за 100', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockImplementationOnce(
        async (_url, _formData, config) => {
          config?.onUploadProgress?.({
            loaded: 150,
            total: 100,
          } as never);

          return {
            data: {
              success: true,
              data: {
                file: mockFileAttachment,
              },
            },
          } as never;
        },
      );

      await fileService.uploadFile('doc-777', file, onProgress);

      expect(onProgress).toHaveBeenCalledWith(100);
    });

    // 13. Відсутність total та нульовий розмір
    it('13. Не повинен обчислювати прогрес, якщо total дорівнює нулю', async () => {
      const file = new File([], 'empty.pdf', {
        type: 'application/pdf',
      });
      const onProgress = vi.fn();

      vi.mocked(api.post).mockImplementationOnce(
        async (_url, _formData, config) => {
          config?.onUploadProgress?.({
            loaded: 0,
            total: 0,
          } as never);

          return {
            data: {
              success: true,
              data: {
                file: mockFileAttachment,
              },
            },
          } as never;
        },
      );

      await fileService.uploadFile('doc-777', file, onProgress);

      // ua: проміжний прогрес не обчислюється, але фінальний 100% викликається
      expect(onProgress).toHaveBeenCalledTimes(1);
      expect(onProgress).toHaveBeenCalledWith(100);
    });

    // 14. Некоректний success
    it('14. Повинен викидати помилку, якщо success має значення false', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: false,
          data: {
            file: mockFileAttachment,
          },
        },
      } as never);

      await expect(
        fileService.uploadFile('doc-777', file, onProgress),
      ).rejects.toThrow('Invalid response while uploading file');

      expect(onProgress).not.toHaveBeenCalled();
    });

    // 15. Відсутність файлу у відповіді
    it('15. Повинен викидати помилку, якщо API не повертає file', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            file: null,
          },
        },
      } as never);

      await expect(
        fileService.uploadFile('doc-777', file, onProgress),
      ).rejects.toThrow('Invalid response while uploading file');

      expect(onProgress).not.toHaveBeenCalled();
    });

    // 16. Відсутність data
    it('16. Повинен викидати помилку, якщо data відсутнє', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      await expect(
        fileService.uploadFile('doc-777', file, onProgress),
      ).rejects.toThrow('Invalid response while uploading file');
    });

    // 17. HTTP-помилка
    it('17. Повинен передавати помилку API під час завантаження файлу', async () => {
      const file = createMockFile();
      const onProgress = vi.fn();
      const mockError = new Error('File upload failed');

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(
        fileService.uploadFile('doc-777', file, onProgress),
      ).rejects.toBe(mockError);
    });
  });
});
