// hook для отримання ревізій (історії змін) конкретного документа

'use client';

import { useQuery } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';

export const useDocumentRevisions = (documentId: string) => {
  return useQuery({
    queryKey: ['document-revisions', documentId],
    queryFn: () => documentService.getDocumentRevisions(documentId),
    enabled: false, // ua: запит блок по дефолту, тригериться вручну через refetch()
    staleTime: 1000 * 60 * 5, // кеш 5 хвилин
  });
};
