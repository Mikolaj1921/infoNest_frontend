import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  workspaceService,
  UpdateWorkspaceDTO,
} from '@/services/workspace.service';
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';

// ua: хук для перейменування та видалення воркспейсів
export const useUpdateWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      workspaceId,
      dto,
    }: {
      workspaceId: string;
      dto: Partial<UpdateWorkspaceDTO>;
    }) => workspaceService.updateWorkspace(workspaceId, dto),

    onSuccess: (updatedWorkspace) => {
      queryClient.setQueryData(
        ['workspaces'],
        (oldWorkspaces: (typeof updatedWorkspace)[] | undefined) => {
          if (!oldWorkspaces) return oldWorkspaces;

          return oldWorkspaces.map((workspace) =>
            workspace.id === updatedWorkspace.id ? updatedWorkspace : workspace,
          );
        },
      );

      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace updated successfully!');
    },

    onError: (error) => handleGlobalError(error),
  });
};

export const useDeleteWorkspace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workspaceId: string) =>
      workspaceService.deleteWorkspace(workspaceId),

    onSuccess: (_, workspaceId) => {
      queryClient.setQueryData(
        ['workspaces'],
        (oldWorkspaces: { id: string }[] | undefined) => {
          if (!oldWorkspaces) return oldWorkspaces;

          return oldWorkspaces.filter(
            (workspace) => workspace.id !== workspaceId,
          );
        },
      );

      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Workspace deleted successfully!');
    },

    onError: (error) => handleGlobalError(error),
  });
};
