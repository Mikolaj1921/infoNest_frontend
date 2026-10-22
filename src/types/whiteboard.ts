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

// ua: ролі користувачів у воркспейсі
export type WhiteboardRole = 'Owner' | 'Admin' | 'Editor' | 'Viewer' | 'Guest';

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

// ua: дані дошки разом із роллю поточного користувача
export interface WorkspaceWhiteboardData {
  whiteboard: Whiteboard;
  role: WhiteboardRole;
}

// ua: типізація відповіді API
export interface WhiteboardResponse {
  success: boolean;
  data: WorkspaceWhiteboardData;
}

// ua: дані, які надсилаються для збереження елементів дошки
export interface UpdateWhiteboardPayload {
  elements: WhiteboardElements;
}

// ua: дані, які надсилаються для збереження налаштувань дошки
export interface UpdateWhiteboardSettingsPayload {
  settings: WhiteboardSettings;
}
