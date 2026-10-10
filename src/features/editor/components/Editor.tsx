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
import { useRef, useEffect } from 'react';

interface EditorProps {
  initialContent: string;
  onContentChange: (htmlContent: string, isDirty: boolean) => void;
}

export const Editor = ({ initialContent, onContentChange }: EditorProps) => {
  const initialContentRef = useRef(initialContent);

  const editor = useEditor({
    // configuring the editor with extensions and initial content

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
    immediatelyRender: false, // ua:  відкладений рендеринг редактора для покращення продуктивності
    // onUpdate callback to handle content changes
    onUpdate: ({ editor: currentEditor }) => {
      const currentHTML = currentEditor.getHTML();
      const isDirty = currentHTML !== initialContentRef.current;
      onContentChange(currentHTML, isDirty);
    },
  });

  // update, ua: функція для завантаження та вставки зображення в редактор
  const uploadAndInsertImage = async (file: File) => {
    if (!editor) return;

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
  };

  // update: ua: додавання обробників подій для перетягування та вставки зображень у редактор
  if (editor && !editor.options.editorProps.handleDrop) {
    editor.setOptions({
      editorProps: {
        handleDrop: (view, event) => {
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
              uploadAndInsertImage(imageFile);
              return true;
            }
          }
          return false;
        },
        handlePaste: (view, event) => {
          const items = Array.from(event.clipboardData?.items || []);

          const imageItem = items.find((item) =>
            item.type.startsWith('image/'),
          );
          if (imageItem) {
            const file = imageItem.getAsFile();
            if (file) {
              event.preventDefault();
              uploadAndInsertImage(file);
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
              uploadAndInsertImage(fileFromBase64);
              return true;
            }
          }

          return false;
        },
      },
    });
  }

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
