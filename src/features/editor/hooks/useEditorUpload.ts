'use client';

import { useCallback, useEffect } from 'react';
import type { Editor } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';
import { toast } from 'sonner';

import { fileService } from '@/services/file.service';
import { convertBase64ToFile } from '@/utils/base64-converter';
import {
  EDITOR_ALLOWED_IMAGE_TYPES,
  EDITOR_MAX_IMAGE_SIZE,
} from '@/types/editor';

// ua: хук для завантаження та вставлення зображень у редактор
export const useEditorUpload = (editor: Editor | null) => {
  // ua: перевірка допустимого формату та розміру зображення
  const validateImage = useCallback((file: File): boolean => {
    if (
      !EDITOR_ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof EDITOR_ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      toast.error('Unsupported image format. Use PNG, JPG, WebP or GIF.');
      return false;
    }

    if (file.size > EDITOR_MAX_IMAGE_SIZE) {
      toast.error('Image size must not exceed 10 MB.');
      return false;
    }

    return true;
  }, []);

  // ua: завантаження зображення та вставлення його в редактор
  const uploadAndInsertImage = useCallback(
    async (file: File) => {
      if (!editor || !editor.isEditable) return;
      if (!validateImage(file)) return;

      const toastId = toast.loading(`Uploading image: ${file.name}...`);

      try {
        const uploadedFile = await fileService.uploadFile(
          'inline-editor-image',
          file,
          () => {},
        );

        if (!editor.isDestroyed && editor.isEditable) {
          editor
            .chain()
            .focus()
            .setImage({
              src: uploadedFile.url,
              alt: file.name,
            })
            .run();
        }

        toast.success('Image inserted successfully', { id: toastId });
      } catch (error) {
        console.error('Failed to upload inline image:', error);
        toast.error('Failed to upload image to text', { id: toastId });
      }
    },
    [editor, validateImage],
  );

  // ua: обробка перетягування зображень у редактор
  const handleDrop = useCallback(
    (_view: EditorView, event: DragEvent): boolean => {
      if (!editor?.isEditable || !event.dataTransfer?.files.length) {
        return false;
      }

      const imageFile = Array.from(event.dataTransfer.files).find((file) =>
        file.type.startsWith('image/'),
      );

      if (!imageFile) return false;

      event.preventDefault();
      void uploadAndInsertImage(imageFile);

      return true;
    },
    [editor, uploadAndInsertImage],
  );

  // ua: обробка вставлення зображень із буфера обміну
  const handlePaste = useCallback(
    (_view: EditorView, event: ClipboardEvent): boolean => {
      if (!editor?.isEditable) return false;

      const items = Array.from(event.clipboardData?.items || []);

      const imageItem = items.find((item) => item.type.startsWith('image/'));

      if (imageItem) {
        const file = imageItem.getAsFile();

        if (file) {
          event.preventDefault();
          void uploadAndInsertImage(file);
          return true;
        }
      }

      // ua: підтримка вставлення Base64-зображень як тексту
      const textData = event.clipboardData?.getData('text/plain') || '';

      if (textData.startsWith('data:image/') && textData.includes(';base64,')) {
        try {
          const fileFromBase64 = convertBase64ToFile(textData);

          if (fileFromBase64) {
            event.preventDefault();
            void uploadAndInsertImage(fileFromBase64);
            return true;
          }
        } catch (error) {
          console.error('Failed to convert Base64 image:', error);
          toast.error('Failed to process pasted image');
        }
      }

      return false;
    },
    [editor, uploadAndInsertImage],
  );

  // ua: підключення обробників подій до редактора
  useEffect(() => {
    if (!editor) return;

    editor.setOptions({
      editorProps: {
        handleDrop,
        handlePaste,
      },
    });
  }, [editor, handleDrop, handlePaste]);

  return {
    uploadAndInsertImage,
  };
};
