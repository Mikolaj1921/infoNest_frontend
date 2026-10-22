import type {
  WhiteboardAppState,
  WhiteboardContent,
  WhiteboardElements,
} from '../components/WhiteboardCanvas';
import type { WhiteboardSettings } from '@/types/whiteboard';

// ua: перелік налаштувань Excalidraw, які потрібно зберігати в базі
export const PERSISTED_APP_STATE_KEYS = [
  'theme',
  'viewBackgroundColor',
  'gridSize',
  'gridModeEnabled',
  'zenModeEnabled',
  'currentItemStrokeColor',
  'currentItemBackgroundColor',
  'currentItemFillStyle',
  'currentItemStrokeWidth',
  'currentItemStrokeStyle',
  'currentItemRoughness',
  'currentItemOpacity',
  'currentItemFontFamily',
  'currentItemFontSize',
  'currentItemTextAlign',
  'currentItemStartArrowhead',
  'currentItemEndArrowhead',
] as const;

// ua: властивості які тре зберігати
export function pickPersistedAppState(
  appState: WhiteboardAppState,
): WhiteboardSettings {
  const persistedState: Record<string, unknown> = {};

  for (const key of PERSISTED_APP_STATE_KEYS) {
    const value = appState[key];

    if (value !== undefined) {
      persistedState[key] = value;
    }
  }

  return persistedState as WhiteboardSettings;
}

// ua: оба формати старий і новий
// { elements, appState }
export function readWhiteboardContent(content: unknown): WhiteboardContent {
  if (Array.isArray(content)) {
    return {
      elements: content as WhiteboardElements,
      appState: {},
    };
  }

  if (
    content &&
    typeof content === 'object' &&
    'elements' in content &&
    Array.isArray(content.elements)
  ) {
    const savedContent = content as {
      elements: WhiteboardElements;
      appState?: WhiteboardAppState;
    };

    return {
      elements: savedContent.elements,
      appState: savedContent.appState ?? {},
    };
  }

  return {
    elements: [],
    appState: {},
  };
}
