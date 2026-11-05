import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';

// ua: конфігурація всіх розширень редактора
export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3],
    },
  }),

  Placeholder.configure({
    placeholder: 'Please start typing your text here...',
    emptyEditorClass: 'is-editor-empty',
  }),

  Image.configure({
    inline: false,
    allowBase64: false,
    HTMLAttributes: {
      class:
        'max-w-full h-auto rounded-xl mx-auto border border-border/40 my-4 shadow-sm select-none',
    },
  }),

  // ua: вирівнювання заголовків та абзаців
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),

  // ua: підтримка стилів та кольорів тексту
  TextStyle,
  Color,

  // ua: кольорове виділення тексту
  Highlight.configure({
    multicolor: true,
  }),
];
