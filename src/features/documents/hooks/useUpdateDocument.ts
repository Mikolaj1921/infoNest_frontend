// hooks for updating document content in the backend
// ua: кастомний хук для мутації ручного збереження тексту документа в базу

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  documentService,
  UpdateDocumentDTO,
} from '@/services/document.service';
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';

interface UseUpdateDocumentOptions {
  onSuccessCb?: () => void; // ua: колбек для синхр тексту на сторінці після збереження
}

// ua: кастомний хук для мутації ручного збереження тексту документа в базу
export const useUpdateDocument = (
  docId: string,
  options?: UseUpdateDocumentOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    // ua: метод сервісу для відправкипетча на бек
    mutationFn: (dto: UpdateDocumentDTO) =>
      documentService.updateDocument(docId, dto),

    onSuccess: () => {
      // апдейтимо кеш структури воркспейсу
      queryClient.invalidateQueries({ queryKey: ['workspace-structure'] });

      // ua: повідомлення про успішне збереження
      toast.success('Changes saved successfully');

      // ua: викликаємо колбек - синхр статусу
      if (options?.onSuccessCb) {
        options.onSuccessCb();
      }
    },

    onError: (error) => {
      handleGlobalError(error);
    },
  });
};
