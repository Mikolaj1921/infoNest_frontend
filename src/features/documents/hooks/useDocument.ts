import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';
import { useEffect } from 'react';

// ua: кастомний хук для отримання даних одного конкретного документа
export const useDocument = (docId: string) => {
  const query = useQuery({
    queryKey: ['document', docId],
    queryFn: () => documentService.getDocumentbyId(docId),
    enabled: !!docId, // ua: якщо ID порожній request не відправляється
    staleTime: 5 * 60 * 1000, // ua: 5 хвилин actual data
  });

  useEffect(() => {
    if (query.isError) {
      handleGlobalError(query.error);
    }
  }, [query.isError, query.error]);

  return query;
};
