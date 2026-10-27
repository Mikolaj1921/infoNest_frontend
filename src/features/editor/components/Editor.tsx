'use client';

// ua: компонент редактора
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { fileService } from '@/services/file.service';
import { convertBase64ToFile } from '@/utils/base64-converter';
import { toast } from 'sonner';

// component
import { Toolbar } from './Toolbar';
import { useCallback, useEffect, useRef } from 'react';

interface EditorProps {
  initialContent: string;
  onContentChange: (htmlContent: string, isDirty: boolean) => void;
  editable?: boolean;
}

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
    // configuring the editor with extensions

    // types
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

      // ua: підключаємо розширення зображень із базовою стилізацією класів Tailwind
      Image.configure({
        HTMLAttributes: {
          class:
            'max-w-full h-auto rounded-xl mx-auto border border-border/40 my-4 shadow-sm select-none',
        },
      }),
    ],
    // content for the editor
    content: initialContent,
    editable,
    immediatelyRender: false, // ua:  відкладений рендеринг редактора для покращення продуктивності

    // onUpdate callback to handle content changes
    onUpdate: ({ editor: currentEditor }) => {
      const currentHTML = currentEditor.getHTML();
      const isDirty = currentHTML !== initialContentRef.current;

      onContentChangeRef.current(currentHTML, isDirty);
    },
  });

  // update, ua: функція для завантаження та вставки зображення в редактор
  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!editor || !editor.isEditable) return;

      if (!file.type.startsWith('image/')) {
        toast.error('Allow only images to be uploaded (PNG, JPG, WebP...)');
        return;
      }

      const toastId = toast.loading(`Uploading image: ${file.name}...`);

      try {
        const uploadedFile = await fileService.uploadFile(
          'inline-editor-image',
          file,
          () => {},
        );

        editor
          .chain()
          .focus()
          .setImage({ src: uploadedFile.url, alt: file.name })
          .run();

        toast.success('Image inserted successfully', { id: toastId });
      } catch (error) {
        console.error('Failed to upload inline image:', error);
        toast.error('Failed to upload image to text', { id: toastId });
      }
    },
    [editor],
  );

  // update: ua: додавання обробників подій для перетягування та вставки зображень у редактор
  useEffect(() => {
    if (!editor) return;

    editor.setOptions({
      editorProps: {
        handleDrop: (_view, event) => {
          if (!editor.isEditable) return false;

          if (
            event.dataTransfer &&
            event.dataTransfer.files &&
            event.dataTransfer.files.length > 0
          ) {
            const files = Array.from(event.dataTransfer.files);
            const imageFile = files.find((file) =>
              file.type.startsWith('image/'),
            );

            if (imageFile) {
              event.preventDefault();
              void uploadAndInsertImage(imageFile);
              return true;
            }
          }

          return false;
        },

        handlePaste: (_view, event) => {
          if (!editor.isEditable) return false;

          const items = Array.from(event.clipboardData?.items || []);

          const imageItem = items.find((item) =>
            item.type.startsWith('image/'),
          );

          if (imageItem) {
            const file = imageItem.getAsFile();

            if (file) {
              event.preventDefault();
              void uploadAndInsertImage(file);
              return true;
            }
          }

          const textData = event.clipboardData?.getData('text/plain') || '';

          if (
            textData.startsWith('data:image/') &&
            textData.includes(';base64,')
          ) {
            const fileFromBase64 = convertBase64ToFile(textData);

            if (fileFromBase64) {
              event.preventDefault();
              void uploadAndInsertImage(fileFromBase64);
              return true;
            }
          }

          return false;
        },
      },
    });
  }, [editor, uploadAndInsertImage]);

  useEffect(() => {
    if (!editor) return;

    // ua: синхронізація вмісту після завантаження документа або збереження
    initialContentRef.current = initialContent;

    if (initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [initialContent, editor]);

  // ua: блокування редагування під час перегляду старої ревізії
  useEffect(() => {
    if (!editor) return;

    editor.setEditable(editable);
  }, [editor, editable]);

  useEffect(() => {
    // попередження про незбережені зміни при закритті вкладки
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!editor || !editor.isEditable) return;

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
