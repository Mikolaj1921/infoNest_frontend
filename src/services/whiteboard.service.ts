import api from '@/lib/axios';
import type {
  Whiteboard,
  WhiteboardResponse,
  WorkspaceWhiteboardData,
  UpdateWhiteboardPayload,
  UpdateWhiteboardSettingsPayload,
} from '@/types/whiteboard';

// ua: сервіс роботи з інтерактивною дошкою
export const whiteboardService = {
  // ua: отримання або автоматична ініціалізація дошки воркспейсу
  getWorkspaceWhiteboard: async (
    workspaceId: string,
  ): Promise<WorkspaceWhiteboardData | null> => {
    const { data } = await api.get<WhiteboardResponse>(
      `/whiteboards/workspace/${workspaceId}`,
    );

    return data?.success ? data.data : null;
  },

  // ua: збереження фігур інтерактивної дошки
  updateWhiteboard: async (
    whiteboardId: string,
    workspaceId: string,
    payload: UpdateWhiteboardPayload,
  ): Promise<Whiteboard> => {
    const { data } = await api.patch<{
      success: boolean;
      data: { whiteboard: Whiteboard };
    }>(
      `/whiteboards/${whiteboardId}?workspaceId=${encodeURIComponent(workspaceId)}`,
      payload,
    );

    return data.data.whiteboard;
  },

  // ua: збереження налаштувань інтерактивної дошки (whiteboard)
  updateWhiteboardSettings: async (
    whiteboardId: string,
    workspaceId: string,
    payload: UpdateWhiteboardSettingsPayload,
  ): Promise<Whiteboard> => {
    const { data } = await api.patch<{
      success: boolean;
      data: { whiteboard: Whiteboard };
    }>(
      `/whiteboards/${whiteboardId}/settings?workspaceId=${encodeURIComponent(workspaceId)}`,
      payload,
    );

    return data.data.whiteboard;
  },
};
