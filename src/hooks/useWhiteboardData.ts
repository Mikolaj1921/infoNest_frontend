'use client';

// ua: хуки для отримання та збереження дошки

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { toast } from 'sonner';

import { whiteboardService } from '@/services/whiteboard.service';

import type {
  UpdateWhiteboardPayload,
  UpdateWhiteboardSettingsPayload,
  Whiteboard,
} from '@/types/whiteboard';

// ua: хук для отримання або створення дошки конкретного воркспейсу
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
      // ua: оновлюємо лише елементи, щоб не перезаписати новіші налаштування
      queryClient.setQueryData<Whiteboard | null>(
        ['workspace-whiteboard', workspaceId],
        (currentData) => {
          if (!currentData) {
            return updatedData;
          }

          return {
            ...currentData,
            elements: updatedData.elements,
            updatedAt: updatedData.updatedAt,
          };
        },
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
      // ua: оновлюємо лише налаштування, не перезаписуючи новіші елементи
      queryClient.setQueryData<Whiteboard | null>(
        ['workspace-whiteboard', workspaceId],
        (currentData) => {
          if (!currentData) {
            return updatedData;
          }

          return {
            ...currentData,
            settings: updatedData.settings,
            updatedAt: updatedData.updatedAt,
          };
        },
      );
    },

    onError: () => {
      toast.error('Failed to save whiteboard settings');
    },
  });
};
