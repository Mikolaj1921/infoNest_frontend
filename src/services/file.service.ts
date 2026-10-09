// ua: сервіс для роботи з файлами (отримання списку файлів документа, видалення файлу) ітд

import api from '@/lib/axios';
import axios from 'axios';
import { FileAttachment, DocumentFilesResponse } from '@/types/document';

// ua: сервіс для роботи з файлами
export const fileService = {
  // ua: отримати список файлів документа
  getDocumentFiles: async (documentId: string): Promise<FileAttachment[]> => {
    try {
      const { data } = await api.get<DocumentFilesResponse>(
        `/documents/${documentId}/files`,
      );

      const res: DocumentFilesResponse | null = data;

      if (
        res &&
        typeof res === 'object' &&
        res.success === true &&
        Array.isArray(res.data)
      ) {
        return res.data;
      }

      return [];
    } catch (error) {
      // ua: якщо бекенд повернув 404 (файлів немає або маршрут не ініціалізовано), то звертає чистий масив
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(
          `[infoNest] No attachments found for document ${documentId}. Rendering empty grid.`,
        );
        return [];
      }
      return Promise.reject(error);
    }
  },

  // ua: видалити файл документа
  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  // ua: завантажити файл до документа (перетягування)
  uploadFile: async (
    documentId: string,
    file: File,
    onProgress: (percent: number) => void,
  ): Promise<FileAttachment> => {
    // binary data
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentId', documentId);

    try {
      // розком коли бекенд буде готовий
      /*
      const { data } = await api.post<any>('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || file.size;
          const percent = Math.round((progressEvent.loaded * 100) / total);
          onProgress(percent);
        }
      });
      return data.data;
      */

      // тимчасова імітація прогресу для тестування фронтенду (етап 2)
      return new Promise((resolve) => {
        let currentPercent = 0;
        const interval = setInterval(() => {
          currentPercent += 20;
          onProgress(currentPercent);

          if (currentPercent >= 100) {
            clearInterval(interval);

            // фейковий обєкт створеного файлу
            resolve({
              id: `file-${Math.random().toString(36).substr(2, 9)}`,
              documentId,
              ownerId: 'current-user',
              fileName: file.name,
              url: URL.createObjectURL(file), // тимчасове локальне посилання для перегляду
              size: file.size,
              createdAt: new Date().toISOString(),
            });
          }
        }, 300);
      });
    } catch (error) {
      return Promise.reject(error);
    }
  },
};
