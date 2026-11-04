// ua: типи та інтерфейси для редактора

import type { Editor } from '@tiptap/react';

// ua: пропси основного компонента редактора
export interface EditorProps {
  initialContent: string;
  onContentChange: (htmlContent: string, isDirty: boolean) => void;
  editable?: boolean;
}

// ua: пропси панелі інструментів
export interface ToolbarProps {
  editor: Editor;
}

// ua: пропси компонентів форматування
export interface EditorToolbarSectionProps {
  editor: Editor;
  disabled?: boolean;
}

// ua: налаштування редактора
export interface EditorConfig {
  placeholder: string;
  headingLevels: Array<1 | 2 | 3>;
}

// ua: результат завантаження зображення
export interface EditorUploadedImage {
  url: string;
  name: string;
}

// ua: дозволені формати зображень
export const EDITOR_ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
] as const;

// ua: максимальний розмір зображення — 10 MB
export const EDITOR_MAX_IMAGE_SIZE = 10 * 1024 * 1024;
