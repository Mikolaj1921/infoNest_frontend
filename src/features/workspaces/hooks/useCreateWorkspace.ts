// ua: hook для створення воркспейсу з авто оновленням списку
//  та глобальним обробником помилок

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  workspaceService,
  CreateWorkspaceDTO,
} from '@/services/workspace.service';
// global error handler & toast manager
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';

interface UseCreateWorkspaceOptions {
  onSuccessCb?: () => void; // ua: колбек для закриття модалки та очищення полів форми
}

// ua: хук
export const useCreateWorkspace = (options?: UseCreateWorkspaceOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateWorkspaceDTO) =>
      workspaceService.createWorkspace(dto),
    onSuccess: () => {
      // ua: стягування оновленого списку воркспейсів з сервера
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });

      toast.success('Workspace created successfully!');

      // ua: закриття модалки
      if (options?.onSuccessCb) {
        options.onSuccessCb();
      }
    },
    onError: (error) => {
      // ua: глобальний утилітний обробник помилок
      handleGlobalError(error);
    },
  });
};
