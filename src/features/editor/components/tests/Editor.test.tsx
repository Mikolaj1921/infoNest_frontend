// ua: тести для компонента Editor

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { Editor } from '../Editor';

// ua: моки TipTap та залежностей редактора
const mocks = vi.hoisted(() => {
  const editor = {
    isEditable: true,
    getHTML: vi.fn(),
    setEditable: vi.fn(),
    commands: {
      setContent: vi.fn(),
    },
  };

  return {
    editor,
    useEditor: vi.fn(),
    uploadAndInsertImage: vi.fn(),
  };
});

vi.mock('@tiptap/react', () => ({
  useEditor: mocks.useEditor,
  EditorContent: ({
    editor,
    className,
  }: {
    editor: unknown;
    className?: string;
  }) => (
    <div
      data-testid="editor-content"
      data-editor={editor ? 'initialized' : 'not-initialized'}
      className={className}
    />
  ),
}));

vi.mock('../Toolbar', () => ({
  Toolbar: ({
    editor,
    onInsertImage,
  }: {
    editor: unknown;
    onInsertImage: () => void;
  }) => (
    <div data-testid="toolbar" data-editor={editor ? 'initialized' : ''}>
      <button type="button" onClick={onInsertImage}>
        Upload image
      </button>
    </div>
  ),
}));

vi.mock('../EditorBubbleMenu', () => ({
  EditorBubbleMenu: ({ editor }: { editor: unknown }) => (
    <div data-testid="editor-bubble-menu">{editor ? 'Bubble menu' : ''}</div>
  ),
}));

vi.mock('../../hooks/useEditorUpload', () => ({
  useEditorUpload: vi.fn(() => ({
    uploadAndInsertImage: mocks.uploadAndInsertImage,
  })),
}));

vi.mock('../../extensions/editorExtensions', () => ({
  editorExtensions: [],
}));

vi.mock('../../styles/Editor.module.css', () => ({
  default: {
    content: 'editor-content-class',
  },
}));

// ua: допоміжний тип для конфігурації TipTap
interface EditorConfig {
  extensions: unknown[];
  content: string;
  editable: boolean;
  immediatelyRender: boolean;
  onUpdate: (params: {
    editor: {
      getHTML: () => string;
    };
  }) => void;
}

describe('Editor', () => {
  const initialContent = '<p>Initial content</p>';
  const documentId = 'document-123';

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.editor.isEditable = true;
    mocks.editor.getHTML.mockReturnValue(initialContent);

    mocks.useEditor.mockReturnValue(mocks.editor);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ua: базове відображення редактора
  describe('Rendering', () => {
    it('повинен відображати полотно редактора', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(screen.getByTestId('editor-content')).toBeTruthy();
    });

    it('повинен відображати Toolbar у режимі редагування', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable
        />,
      );

      expect(screen.getByTestId('toolbar')).toBeTruthy();
    });

    it('повинен відображати BubbleMenu у режимі редагування', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable
        />,
      );

      expect(screen.getByTestId('editor-bubble-menu')).toBeTruthy();
    });

    it('не повинен відображати Toolbar у режимі лише для читання', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      expect(screen.queryByTestId('toolbar')).toBeNull();
    });

    it('не повинен відображати BubbleMenu у режимі лише для читання', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      expect(screen.queryByTestId('editor-bubble-menu')).toBeNull();
    });

    it('повинен відображати повідомлення про режим лише для читання', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      expect(screen.getByText('Перегляд лише для читання')).toBeTruthy();
    });

    it('не повинен відображати повідомлення про режим читання під час редагування', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable
        />,
      );

      expect(screen.queryByText('Перегляд лише для читання')).toBeNull();
    });

    it('повинен повертати null, поки редактор не ініціалізований', () => {
      mocks.useEditor.mockReturnValue(null);

      const { container } = render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(container.firstChild).toBeNull();
    });
  });

  // ua: конфігурація ініціалізації TipTap
  describe('Editor initialization', () => {
    it('повинен ініціалізувати редактор із початковим контентом', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      const config = mocks.useEditor.mock.calls[0][0] as EditorConfig;

      expect(config.content).toBe(initialContent);
      expect(config.editable).toBe(true);
      expect(config.immediatelyRender).toBe(false);
      expect(config.extensions).toEqual([]);
    });

    it('повинен передавати початковий режим editable у конфігурацію редактора', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      const config = mocks.useEditor.mock.calls[0][0] as EditorConfig;

      expect(config.editable).toBe(false);
    });
  });

  // ua: перевірка обробки змін контенту
  describe('Content changes', () => {
    it('повинен викликати onContentChange після зміни контенту', () => {
      const onContentChange = vi.fn();
      const updatedContent = '<p>Updated content</p>';

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={onContentChange}
        />,
      );

      const config = mocks.useEditor.mock.calls[0][0] as EditorConfig;

      config.onUpdate({
        editor: {
          getHTML: () => updatedContent,
        },
      });

      expect(onContentChange).toHaveBeenCalledWith(updatedContent, true);
    });

    it('повинен передавати isDirty false, якщо контент не змінився', () => {
      const onContentChange = vi.fn();

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={onContentChange}
        />,
      );

      const config = mocks.useEditor.mock.calls[0][0] as EditorConfig;

      config.onUpdate({
        editor: {
          getHTML: () => initialContent,
        },
      });

      expect(onContentChange).toHaveBeenCalledWith(initialContent, false);
    });

    it('повинен використовувати актуальний callback після повторного рендерингу', () => {
      const firstCallback = vi.fn();
      const secondCallback = vi.fn();

      const { rerender } = render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={firstCallback}
        />,
      );

      rerender(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={secondCallback}
        />,
      );

      const config = mocks.useEditor.mock.calls[0][0] as EditorConfig;
      const updatedContent = '<p>New content</p>';

      config.onUpdate({
        editor: {
          getHTML: () => updatedContent,
        },
      });

      expect(firstCallback).not.toHaveBeenCalled();
      expect(secondCallback).toHaveBeenCalledWith(updatedContent, true);
    });
  });

  // ua: синхронізація зовнішнього початкового контенту
  describe('Initial content synchronization', () => {
    it('повинен оновлювати контент редактора, якщо initialContent змінився', () => {
      const updatedContent = '<p>Content from server</p>';

      const { rerender } = render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      rerender(
        <Editor
          documentId={documentId}
          initialContent={updatedContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(mocks.editor.commands.setContent).toHaveBeenCalledWith(
        updatedContent,
        { emitUpdate: false },
      );
    });

    it('не повинен оновлювати контент, якщо він не змінився', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(mocks.editor.commands.setContent).not.toHaveBeenCalled();
    });

    it('не повинен оновлювати контент до ініціалізації редактора', () => {
      mocks.useEditor.mockReturnValue(null);

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(mocks.editor.commands.setContent).not.toHaveBeenCalled();
    });
  });

  // ua: перемикання режиму редагування
  describe('Editable mode', () => {
    it('повинен встановлювати режим редагування під час ініціалізації', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable
        />,
      );

      expect(mocks.editor.setEditable).toHaveBeenCalledWith(true);
    });

    it('повинен вимикати редагування, коли editable стає false', () => {
      const { rerender } = render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable
        />,
      );

      rerender(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      expect(mocks.editor.setEditable).toHaveBeenLastCalledWith(false);
    });

    it('не повинен змінювати режим редагування до ініціалізації редактора', () => {
      mocks.useEditor.mockReturnValue(null);

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(mocks.editor.setEditable).not.toHaveBeenCalled();
    });
  });

  // ua: інтеграція завантаження зображень
  describe('Image upload integration', () => {
    it('повинен передавати editor та documentId у useEditorUpload', async () => {
      const { useEditorUpload } = await import('../../hooks/useEditorUpload');

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      expect(useEditorUpload).toHaveBeenCalledWith(mocks.editor, documentId);
    });

    it('повинен передавати uploadAndInsertImage у Toolbar', () => {
      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Upload image' }));

      expect(mocks.uploadAndInsertImage).toHaveBeenCalledTimes(1);
    });
  });

  // ua: захист від втрати незбережених змін
  describe('Before unload protection', () => {
    it('повинен блокувати закриття сторінки, якщо є незбережені зміни', () => {
      mocks.editor.getHTML.mockReturnValue('<p>Modified content</p>');

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      const event = new Event('beforeunload', {
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it('не повинен блокувати закриття сторінки, якщо контент не змінений', () => {
      mocks.editor.getHTML.mockReturnValue(initialContent);

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      const event = new Event('beforeunload', {
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('не повинен блокувати закриття сторінки у режимі лише для читання', () => {
      mocks.editor.isEditable = false;
      mocks.editor.getHTML.mockReturnValue('<p>Modified content</p>');

      render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
          editable={false}
        />,
      );

      const event = new Event('beforeunload', {
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it('повинен видаляти beforeunload listener після демонтування компонента', () => {
      mocks.editor.getHTML.mockReturnValue('<p>Modified content</p>');

      const { unmount } = render(
        <Editor
          documentId={documentId}
          initialContent={initialContent}
          onContentChange={vi.fn()}
        />,
      );

      unmount();

      const event = new Event('beforeunload', {
        cancelable: true,
      });

      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });
});
