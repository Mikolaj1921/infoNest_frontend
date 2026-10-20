import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whiteboardService } from '@/services/whiteboard.service';
import { WhiteboardElements } from '@/features/whiteboard/components/WhiteboardCanvas';
import { toast } from 'sonner';

// ua: хук для отримання або створення Miro-полотна конкретного воркспейсу
export const useWorkspaceWhiteboard = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-whiteboard', workspaceId],
    queryFn: () => whiteboardService.getWorkspaceWhiteboard(workspaceId),
    enabled: !!workspaceId,
  });
};

// ua: хук мутації для фонового автозбереження стану фігур на дошці
export const useUpdateWhiteboard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      whiteboardId,
      elements,
    }: {
      whiteboardId: string;
      elements: WhiteboardElements;
    }) =>
      whiteboardService.updateWhiteboard(whiteboardId, workspaceId, elements),
    onSuccess: (updatedData) => {
      // оновлюємо дані в кеші TanStack Query вручну без рефетчу, щоб уникнути блимання полотна
      queryClient.setQueryData(
        ['workspace-whiteboard', workspaceId],
        updatedData,
      );
    },
    onError: () => {
      toast.error('Failed to autosave whiteboard progress');
    },
  });
};
