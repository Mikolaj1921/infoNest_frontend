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
};
