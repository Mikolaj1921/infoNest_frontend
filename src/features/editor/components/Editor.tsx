'use client';

// ua: компонент редактора
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

// component
import { Toolbar } from './Toolbar';
import { useRef, useEffect } from 'react';

interface EditorProps {
  initialContent: string;
  onContentChange: (htmlContent: string, isDirty: boolean) => void;
}

export const Editor = ({ initialContent, onContentChange }: EditorProps) => {
  const initialContentRef = useRef(initialContent);

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
    // content for the editor
    content: initialContent,
    // onUpdate callback to handle content changes
    onUpdate: ({ editor: currentEditor }) => {
      const currentHTML = currentEditor.getHTML();
      const isDirty = currentHTML !== initialContentRef.current;
      onContentChange(currentHTML, isDirty);
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (initialContent !== editor.getHTML()) {
      initialContentRef.current = initialContent;
      editor.commands.setContent(initialContent, { emitUpdate: false }); // full param (emitUpdate)
    }
  }, [initialContent, editor]);

  useEffect(() => {
    // попередження про незбережені зміни при закритті вкладки
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!editor) return;

      const isDirty = editor.getHTML() !== initialContentRef.current;

      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    // ua:  обробник події перед закриттям вікна
    window.addEventListener('beforeunload', handleBeforeUnload);

    // unmount cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }
  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 text-left">
      <Toolbar editor={editor} />

      <div className="min-h-[400px] w-full rounded-2xl border border-border bg-card/20 p-6 backdrop-blur-md shadow-inner focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none focus:outline-none"
        />
      </div>
    </div>
  );
};
