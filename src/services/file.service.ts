// ua: сервіс для роботи з файлами (отримання списку файлів документа, видалення файлу) ітд

import api from '@/lib/axios';
import { FileAttachment, DocumentFilesResponse } from '@/types/document';

// ua: сервіс для роботи з файлами
export const fileService = {
  // ua: отримати список файлів документа
  getDocumentFiles: async (documentId: string): Promise<FileAttachment[]> => {
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
  },

  // ua: видалити файл документа
  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },
};
