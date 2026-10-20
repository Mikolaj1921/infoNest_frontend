// types whiteboard

import type { WhiteboardElements } from '@/features/whiteboard/components/WhiteboardCanvas';

// ua: опис моделі інтерактивної дошки з бази даних
export interface Whiteboard {
  id: string;
  workspaceId: string;
  elements: WhiteboardElements;
  createdAt: string;
  updatedAt: string;
}

// ua: типізація відповідей api
export interface WhiteboardResponse {
  success: boolean;
  data: {
    whiteboard: Whiteboard;
  };
}
