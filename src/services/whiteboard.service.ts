// service whiteboard

import api from '@/lib/axios';
import type {
  Whiteboard,
  WhiteboardResponse,
  UpdateWhiteboardPayload,
  UpdateWhiteboardSettingsPayload,
} from '@/types/whiteboard';

// ua: сервіс роботи з інтерактивною дошкою
export const whiteboardService = {
  // ua: отримання або автоматична ініціалізація дошки воркспейсу
  getWorkspaceWhiteboard: async (
    workspaceId: string,
  ): Promise<Whiteboard | null> => {
    const { data } = await api.get<WhiteboardResponse>(
      `/whiteboards/workspace/${workspaceId}`,
    );

    return data?.success ? data.data.whiteboard : null;
  },

  // ua: збереження фігур інтерактивної дошки
  updateWhiteboard: async (
    whiteboardId: string,
    workspaceId: string,
    payload: UpdateWhiteboardPayload,
  ): Promise<Whiteboard> => {
    const { data } = await api.patch<WhiteboardResponse>(
      `/whiteboards/${whiteboardId}?workspaceId=${workspaceId}`,
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
    const { data } = await api.patch<WhiteboardResponse>(
      `/whiteboards/${whiteboardId}/settings?workspaceId=${workspaceId}`,
      payload,
    );

    return data.data.whiteboard;
  },
};
