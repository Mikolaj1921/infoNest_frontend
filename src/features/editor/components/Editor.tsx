'use client';

// ua: компонент редактора
import { useEditor, EditorContent } from '@tiptap/react';
import { useEffect, useRef } from 'react';

// ua: стилі редактора
import styles from './Editor.module.css';

// ua: типи редактора
import type { EditorProps } from '../../../types/editor';

// component
import { Toolbar } from './Toolbar';
import { EditorBubbleMenu } from './EditorBubbleMenu';
import { useEditorUpload } from '../hooks/useEditorUpload';
import { editorExtensions } from '../extensions/editorExtensions';

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
  const { uploadAndInsertImage } = useEditorUpload(editor);

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
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 text-left">
      {editable && (
        <Toolbar editor={editor} onInsertImage={uploadAndInsertImage} />
      )}

      {editable && <EditorBubbleMenu editor={editor} />}

      {!editable && (
        <div className="text-xs font-medium text-amber-500">
          Перегляд лише для читання
        </div>
      )}

      {/* ua: полотно документа */}
      <div className="min-h-[400px] w-full rounded-2xl border border-border bg-card/20 p-4 shadow-inner backdrop-blur-md transition-all duration-300 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20 sm:p-6 lg:p-8">
        <EditorContent editor={editor} className={styles.content} />
      </div>
    </div>
  );
};
