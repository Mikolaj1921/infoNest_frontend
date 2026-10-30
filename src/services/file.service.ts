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

    if (data && data.success === true && Array.isArray(data.data)) {
      return data.data;
    }

    throw new Error('Invalid response while loading document files');
  },

  // ua: видалити файл документа
  deleteFile: async (fileId: string): Promise<void> => {
    await api.delete(`/files/${fileId}`);
  },

  // ua: завантажити файл до документа
  uploadFile: async (
    documentId: string,
    file: File,
    onProgress: (percent: number) => void,
  ): Promise<FileAttachment> => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await api.post<{
      success: boolean;
      data: {
        file: FileAttachment;
      };
    }>(`/files/document/${documentId}`, formData, {
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total || file.size;

        if (total > 0) {
          const percent = Math.min(
            100,
            Math.round((progressEvent.loaded * 100) / total),
          );

          onProgress(percent);
        }
      },
    });

    if (!data?.success || !data.data?.file) {
      throw new Error('Invalid response while uploading file');
    }

    onProgress(100);

    return data.data.file;
  },
};
