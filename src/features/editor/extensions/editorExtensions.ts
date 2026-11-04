import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';

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
];
