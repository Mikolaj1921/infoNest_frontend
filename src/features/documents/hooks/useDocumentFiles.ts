// ua: хук для отримання списку файлів документа
// квері хук який використовує сервіс fileService для отримання файлів документа

import { useQuery } from '@tanstack/react-query';
import { fileService } from '@/services/file.service';

export const useDocumentFiles = (documentId: string) => {
  return useQuery({
    queryKey: ['document-files', documentId],
    queryFn: () => fileService.getDocumentFiles(documentId),
    enabled: !!documentId,
    staleTime: 30 * 1000,
  });
};
