// whiteboard service

import api from '@/lib/axios';
import type { Whiteboard, WhiteboardResponse } from '@/types/whiteboard';
import type { WhiteboardElements } from '@/features/whiteboard/components/WhiteboardCanvas';

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

  // ua: фонове автозбереження графічного стану фігур
  updateWhiteboard: async (
    whiteboardId: string,
    workspaceId: string,
    elements: WhiteboardElements,
  ): Promise<Whiteboard> => {
    const { data } = await api.patch<WhiteboardResponse>(
      `/whiteboards/${whiteboardId}?workspaceId=${workspaceId}`,
      { elements },
    );
    return data.data.whiteboard;
  },
};
