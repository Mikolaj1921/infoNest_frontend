'use client';

// ua: компонент редактора
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export const Editor = () => {
  const editor = useEditor({
    // configuring the editor with extensions and initial content

    // Heading, Bold, Italic - StarterKit
    extensions: [
      StarterKit.configure({
        // configure the heading extension - support 1,2,3 lvl headings
        heading: {
          levels: [1, 2, 3],
        },
      }),
      // ua:  підказкa Placeholder
      Placeholder.configure({
        placeholder: 'Please start typing your text here...',
      }),
    ],
    // ua: content for the editor
    content: '<h1>First Heading</h1><p>Some initial content</p>',
  });

  if (!editor) {
    return null;
  }
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 text-left">
      <div className="min-h-[400px] w-full rounded-2xl border border-border bg-card/20 p-6 backdrop-blur-md shadow-inner focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};
