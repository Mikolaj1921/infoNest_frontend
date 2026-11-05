'use client';

// ua: компонент редактора
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';

// component
import { Toolbar } from './Toolbar';
import { useEditorUpload } from '../hooks/useEditorUpload';
import { editorExtensions } from '../extensions/editorExtensions';

interface EditorProps {
  initialContent: string;
  onContentChange: (htmlContent: string, isDirty: boolean) => void;
  editable?: boolean;
}

// component
export const Editor = ({
  initialContent,
  onContentChange,
  editable = true,
}: EditorProps) => {
  const initialContentRef = useRef(initialContent);
  const onContentChangeRef = useRef(onContentChange);

  useEffect(() => {
    onContentChangeRef.current = onContentChange;
  }, [onContentChange]);

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContent,
    editable,
    immediatelyRender: false,
    onUpdate: ({ editor: currentEditor }) => {
      const currentHTML = currentEditor.getHTML();
      const isDirty = currentHTML !== initialContentRef.current;

      onContentChangeRef.current(currentHTML, isDirty);
    },
  });

  // ua: підключення функціоналу завантаження зображень
  useEditorUpload(editor);

  useEffect(() => {
    if (!editor) return;

    initialContentRef.current = initialContent;

    if (initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!editor || !editor.isEditable) return;

      const isDirty = editor.getHTML() !== initialContentRef.current;

      if (isDirty) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4 text-left">
      {editable && <Toolbar editor={editor} />}

      {!editable && (
        <div className="text-xs text-amber-500 font-medium">
          Перегляд лише для читання
        </div>
      )}

      <div className="min-h-[400px] w-full rounded-2xl border border-border bg-card/20 p-6 backdrop-blur-md shadow-inner focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
        <EditorContent
          editor={editor}
          className="prose prose-invert max-w-none focus:outline-none "
        />
      </div>
    </div>
  );
};
