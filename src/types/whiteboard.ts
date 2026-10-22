// types whiteboard

import type {
  WhiteboardAppState,
  WhiteboardContent, // all content
  WhiteboardElements, // sett
  WhiteboardTheme, // theme
} from '@/features/whiteboard/components/WhiteboardCanvas';

// ua: опис налаштувань Excalidraw, які потрібно зберігати між сесіями
export type WhiteboardSettings = Partial<WhiteboardAppState> & {
  theme?: WhiteboardTheme;
};

// ua: опис моделі інтерактивної дошки з бази даних
export interface Whiteboard {
  id: string;
  workspaceId: string;
  columnId?: string | null;
  elements: WhiteboardContent | WhiteboardElements;
  settings: WhiteboardSettings;
  createdAt: string;
  updatedAt: string;
}

// ua: типізація відповідей API
export interface WhiteboardResponse {
  success: boolean;
  data: {
    whiteboard: Whiteboard;
  };
}

// ua: дані, які надсилаються для збереження елементів дошки
export interface UpdateWhiteboardPayload {
  elements: WhiteboardElements;
}

// ua: дані, які надсилаються для збереження налаштувань дошки
export interface UpdateWhiteboardSettingsPayload {
  settings: WhiteboardSettings;
}
