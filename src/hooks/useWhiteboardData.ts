// ua: дата хук дошки

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { whiteboardService } from '@/services/whiteboard.service';
import type {
  UpdateWhiteboardPayload,
  UpdateWhiteboardSettingsPayload,
} from '@/types/whiteboard';

// ua: хук для отримання або створення Miro-полотна конкретного воркспейсу
export const useWorkspaceWhiteboard = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-whiteboard', workspaceId],
    queryFn: () => whiteboardService.getWorkspaceWhiteboard(workspaceId),
    enabled: !!workspaceId,
  });
};

// ua: хук мутації для фонового автозбереження елементів дошки
export const useUpdateWhiteboard = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      whiteboardId,
      ...payload
    }: UpdateWhiteboardPayload & { whiteboardId: string }) =>
      whiteboardService.updateWhiteboard(whiteboardId, workspaceId, payload),

    onSuccess: (updatedData) => {
      // ua: оновлюємо кеш без повторного запиту, щоб уникнути блимання полотна
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

// ua: хук мутації для збереження налаштувань Excalidraw
export const useUpdateWhiteboardSettings = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      whiteboardId,
      ...payload
    }: UpdateWhiteboardSettingsPayload & { whiteboardId: string }) =>
      whiteboardService.updateWhiteboardSettings(
        whiteboardId,
        workspaceId,
        payload,
      ),

    onSuccess: (updatedData) => {
      // ua: оновлюємо кеш налаштувань без повторного завантаження дошки
      queryClient.setQueryData(
        ['workspace-whiteboard', workspaceId],
        updatedData,
      );
    },

    onError: () => {
      toast.error('Failed to save whiteboard settings');
    },
  });
};
