import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { TableKit } from '@tiptap/extension-table';

import { ParagraphStyle } from './ParagraphStyle';

// ua: конфігурація всіх розширень редактора
export const editorExtensions = [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
  }),

  // ua: додаткові стилі звичайних абзаців
  ParagraphStyle,

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

  TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
    defaultAlignment: 'left',
  }),

  TextStyle,
  Color,

  Highlight.configure({
    multicolor: true,
  }),

  // ua: таблиці та їх стилізація
  TableKit.configure({
    table: {
      HTMLAttributes: {
        class: 'w-full border-collapse table-fixed my-4',
      },
    },

    tableHeader: {
      HTMLAttributes: {
        class:
          'border border-border bg-muted/60 px-3 py-2 text-left font-semibold',
      },
    },

    tableCell: {
      HTMLAttributes: {
        class: 'border border-border px-3 py-2 align-top',
      },
    },
  }),
];
