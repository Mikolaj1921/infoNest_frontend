import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Editor } from '@tiptap/react';
import type { EditorView } from '@tiptap/pm/view';

import { useEditorUpload } from './useEditorUpload';
import { fileService } from '@/services/file.service';
import { convertBase64ToFile } from '@/utils/base64-converter';
import {
  EDITOR_ALLOWED_IMAGE_TYPES,
  EDITOR_MAX_IMAGE_SIZE,
} from '@/types/editor';
import { toast } from 'sonner';

vi.mock('@/services/file.service', () => ({
  fileService: {
    uploadFile: vi.fn(),
  },
}));

vi.mock('@/utils/base64-converter', () => ({
  convertBase64ToFile: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    loading: vi.fn(() => 'toast-id'),
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useEditorUpload', () => {
  let editor: Editor;
  let setOptions: ReturnType<typeof vi.fn>;
  let chain: ReturnType<typeof vi.fn>;
  let focus: ReturnType<typeof vi.fn>;
  let setImage: ReturnType<typeof vi.fn>;
  let run: ReturnType<typeof vi.fn>;

  const documentId = 'document-123';

  const createFile = (name = 'image.png', type = 'image/png', size = 1024) =>
    new File([new Uint8Array(size)], name, { type });

  const setEditorProperty = (
    property: 'isEditable' | 'isDestroyed',
    value: boolean,
  ) => {
    Object.defineProperty(editor, property, {
      value,
      configurable: true,
    });
  };

  const getHandlers = () => {
    const options = setOptions.mock.calls.at(-1)?.[0];

    return options?.editorProps as {
      handleDrop: (view: EditorView, event: DragEvent) => boolean;
      handlePaste: (view: EditorView, event: ClipboardEvent) => boolean;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    setOptions = vi.fn();

    run = vi.fn().mockReturnValue(true);
    setImage = vi.fn().mockReturnValue({ run });
    focus = vi.fn().mockReturnValue({ setImage });
    chain = vi.fn().mockReturnValue({ focus });

    editor = {
      isEditable: true,
      isDestroyed: false,
      setOptions,
      chain,
    } as unknown as Editor;

    vi.mocked(fileService.uploadFile).mockResolvedValue({
      url: 'https://example.com/uploaded-image.png',
    } as Awaited<ReturnType<typeof fileService.uploadFile>>);
  });

  describe('Ініціалізація', () => {
    it('1.1. Повинен повертати uploadAndInsertImage', () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      expect(typeof result.current.uploadAndInsertImage).toBe('function');
    });

    it('1.2. Повинен підключати handleDrop та handlePaste', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      expect(setOptions).toHaveBeenCalledTimes(1);

      const handlers = getHandlers();

      expect(typeof handlers.handleDrop).toBe('function');
      expect(typeof handlers.handlePaste).toBe('function');
    });

    it('1.3. Не повинен підключати обробники без редактора', () => {
      renderHook(() => useEditorUpload(null, documentId));

      expect(setOptions).not.toHaveBeenCalled();
    });
  });

  describe('Валідація зображень', () => {
    it.each([
      ['PNG', 'image/png'],
      ['JPG', 'image/jpeg'],
      ['WebP', 'image/webp'],
      ['GIF', 'image/gif'],
    ])('2.1. Повинен приймати формат %s', async (_name, type) => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile('image', type));
      });

      expect(fileService.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('2.2. Повинен відхиляти непідтримуваний формат', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(
          createFile('image.bmp', 'image/bmp'),
        );
      });

      expect(fileService.uploadFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        'Unsupported image format. Use PNG, JPG, WebP or GIF.',
      );
    });

    it('2.3. Повинен відхиляти файл більший за максимальний розмір', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(
          createFile('large.png', 'image/png', EDITOR_MAX_IMAGE_SIZE + 1),
        );
      });

      expect(fileService.uploadFile).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith(
        'Image size must not exceed 10 MB.',
      );
    });

    it('2.4. Повинен приймати файл гранично допустимого розміру', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(
          createFile(
            'max.png',
            EDITOR_ALLOWED_IMAGE_TYPES[0],
            EDITOR_MAX_IMAGE_SIZE,
          ),
        );
      });

      expect(fileService.uploadFile).toHaveBeenCalledTimes(1);
    });
  });

  describe('Завантаження та вставлення', () => {
    it('3.1. Повинен завантажувати файл із правильним documentId', async () => {
      const file = createFile();

      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(file);
      });

      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        file,
        expect.any(Function),
      );
    });

    it('3.2. Повинен вставляти завантажене зображення в редактор', async () => {
      const file = createFile('photo.png');

      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(file);
      });

      expect(chain).toHaveBeenCalled();
      expect(focus).toHaveBeenCalled();
      expect(setImage).toHaveBeenCalledWith({
        src: 'https://example.com/uploaded-image.png',
        alt: 'photo.png',
      });
      expect(run).toHaveBeenCalled();
    });

    it('3.3. Повинен показувати повідомлення про успішне завантаження', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(toast.loading).toHaveBeenCalledWith(
        'Uploading image: image.png...',
      );

      expect(toast.success).toHaveBeenCalledWith(
        'Image inserted successfully',
        { id: 'toast-id' },
      );
    });

    it('3.4. Повинен обробляти помилку завантаження', async () => {
      const error = new Error('Upload failed');

      vi.mocked(fileService.uploadFile).mockRejectedValueOnce(error);

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to upload inline image:',
        error,
      );

      expect(toast.error).toHaveBeenCalledWith(
        'Failed to upload image to text',
        { id: 'toast-id' },
      );

      expect(setImage).not.toHaveBeenCalled();

      consoleError.mockRestore();
    });

    it('3.5. Не повинен вставляти зображення у знищений редактор', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      vi.mocked(fileService.uploadFile).mockImplementationOnce(async () => {
        setEditorProperty('isDestroyed', true);

        return {
          url: 'https://example.com/image.png',
        } as Awaited<ReturnType<typeof fileService.uploadFile>>;
      });

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(setImage).not.toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });

    it('3.6. Не повинен вставляти зображення, якщо редактор став read-only', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      vi.mocked(fileService.uploadFile).mockImplementationOnce(async () => {
        setEditorProperty('isEditable', false);

        return {
          url: 'https://example.com/image.png',
        } as Awaited<ReturnType<typeof fileService.uploadFile>>;
      });

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(setImage).not.toHaveBeenCalled();
    });

    it('3.7. Не повинен завантажувати без редактора', async () => {
      const { result } = renderHook(() => useEditorUpload(null, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('3.8. Не повинен завантажувати в режимі read-only', async () => {
      setEditorProperty('isEditable', false);

      const { result } = renderHook(() => useEditorUpload(editor, documentId));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('3.9. Не повинен завантажувати без documentId', async () => {
      const { result } = renderHook(() => useEditorUpload(editor, ''));

      await act(async () => {
        await result.current.uploadAndInsertImage(createFile());
      });

      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });
  });

  describe('Drag & Drop', () => {
    it('4.1. Повинен знаходити та завантажувати зображення серед перетягнутих файлів', async () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const image = createFile('image.png');
      const textFile = createFile('document.txt', 'text/plain');

      const event = {
        dataTransfer: {
          files: [textFile, image],
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      let handled = false;

      await act(async () => {
        handled = getHandlers().handleDrop({} as EditorView, event);
      });

      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        image,
        expect.any(Function),
      );
    });

    it('4.2. Не повинен перехоплювати Drop без зображень', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        dataTransfer: {
          files: [createFile('document.txt', 'text/plain')],
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      const handled = getHandlers().handleDrop({} as EditorView, event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('4.3. Не повинен перехоплювати Drop без dataTransfer', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        dataTransfer: null,
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      const handled = getHandlers().handleDrop({} as EditorView, event);

      expect(handled).toBe(false);
    });

    it('4.4. Не повинен обробляти Drop у режимі read-only', () => {
      setEditorProperty('isEditable', false);

      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        dataTransfer: {
          files: [createFile()],
        },
        preventDefault: vi.fn(),
      } as unknown as DragEvent;

      const handled = getHandlers().handleDrop({} as EditorView, event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Paste', () => {
    it('5.1. Повинен завантажувати зображення з буфера обміну', async () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const file = createFile('pasted.png');

      const event = {
        clipboardData: {
          items: [
            {
              type: 'image/png',
              getAsFile: vi.fn().mockReturnValue(file),
            },
          ],
          getData: vi.fn().mockReturnValue(''),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      let handled = false;

      await act(async () => {
        handled = getHandlers().handlePaste({} as EditorView, event);
      });

      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        file,
        expect.any(Function),
      );
    });

    it('5.2. Повинен конвертувати та завантажувати Base64-зображення', async () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const base64 = 'data:image/png;base64,AAAA';
      const file = createFile('converted.png');

      vi.mocked(convertBase64ToFile).mockReturnValue(file);

      const event = {
        clipboardData: {
          items: [],
          getData: vi.fn().mockReturnValue(base64),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      let handled = false;

      await act(async () => {
        handled = getHandlers().handlePaste({} as EditorView, event);
      });

      expect(convertBase64ToFile).toHaveBeenCalledWith(base64);
      expect(handled).toBe(true);
      expect(event.preventDefault).toHaveBeenCalled();
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        file,
        expect.any(Function),
      );
    });

    it('5.3. Повинен обробляти помилку Base64-конвертації', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const error = new Error('Invalid Base64');

      vi.mocked(convertBase64ToFile).mockImplementationOnce(() => {
        throw error;
      });

      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const event = {
        clipboardData: {
          items: [],
          getData: vi.fn().mockReturnValue('data:image/png;base64,AAAA'),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const handled = getHandlers().handlePaste({} as EditorView, event);

      expect(handled).toBe(false);
      expect(consoleError).toHaveBeenCalledWith(
        'Failed to convert Base64 image:',
        error,
      );
      expect(toast.error).toHaveBeenCalledWith(
        'Failed to process pasted image',
      );

      consoleError.mockRestore();
    });

    it('5.4. Не повинен перехоплювати звичайний текст', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        clipboardData: {
          items: [],
          getData: vi.fn().mockReturnValue('Ordinary text'),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const handled = getHandlers().handlePaste({} as EditorView, event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('5.5. Не повинен обробляти Paste у режимі read-only', () => {
      setEditorProperty('isEditable', false);

      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        clipboardData: {
          items: [
            {
              type: 'image/png',
              getAsFile: vi.fn().mockReturnValue(createFile()),
            },
          ],
          getData: vi.fn().mockReturnValue(''),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const handled = getHandlers().handlePaste({} as EditorView, event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(fileService.uploadFile).not.toHaveBeenCalled();
    });

    it('5.6. Не повинен перехоплювати зображення, якщо getAsFile повертає null', () => {
      renderHook(() => useEditorUpload(editor, documentId));

      const event = {
        clipboardData: {
          items: [
            {
              type: 'image/png',
              getAsFile: vi.fn().mockReturnValue(null),
            },
          ],
          getData: vi.fn().mockReturnValue(''),
        },
        preventDefault: vi.fn(),
      } as unknown as ClipboardEvent;

      const handled = getHandlers().handlePaste({} as EditorView, event);

      expect(handled).toBe(false);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });
  });
});
