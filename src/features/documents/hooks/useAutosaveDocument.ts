// ua: кастомний хук - автосейв документа (оновлення кешу)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentService,
  UpdateDocumentDTO,
} from '@/services/document.service';
import { WorkspaceDocument, WorkspaceCategory } from '@/types/document';

interface UseAutosaveDocumentOptions {
  onSuccessCb?: (updatedDoc: WorkspaceDocument) => void;
  onErrorCb?: (error: unknown) => void;
}

// ua: кастомний хук для фонового сейву без спаму (caching)
export const useAutosaveDocument = (
  docId: string,
  options?: UseAutosaveDocumentOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: UpdateDocumentDTO) =>
      documentService.updateDocument(docId, dto),

    onSuccess: (updatedDoc) => {
      // ua: Оручне оновлення кешу конкретного документа
      queryClient.setQueryData(['document', docId], updatedDoc);

      queryClient.setQueryData(
        ['workspace-structure', updatedDoc.id],
        (oldCategories: WorkspaceCategory[] | undefined) => {
          if (!Array.isArray(oldCategories)) return oldCategories;

          return oldCategories.map((category: WorkspaceCategory) => ({
            ...category,
            documents: category.documents.map((doc: WorkspaceDocument) =>
              doc.id === docId ? { ...doc, title: updatedDoc.title } : doc,
            ),
          }));
        },
      );

      if (options?.onSuccessCb) {
        options.onSuccessCb(updatedDoc);
      }
    },

    onError: (error) => {
      if (options?.onErrorCb) {
        options.onErrorCb(error);
      }
    },
  });
};
