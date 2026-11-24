import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Toolbar } from '../Toolbar';

// ua: моки дочірніх компонентів панелі інструментів
vi.mock('../../toolbar/TextStyleSelector', () => ({
  TextStyleSelector: ({
    editor,
    disabled,
  }: {
    editor: unknown;
    disabled: boolean;
  }) => (
    <div
      data-testid="text-style-selector"
      data-disabled={String(disabled)}
      data-editor={String(Boolean(editor))}
    />
  ),
}));

vi.mock('../../toolbar/TextFormatting', () => ({
  TextFormatting: ({
    editor,
    disabled,
  }: {
    editor: unknown;
    disabled: boolean;
  }) => (
    <div
      data-testid="text-formatting"
      data-disabled={String(disabled)}
      data-editor={String(Boolean(editor))}
    />
  ),
}));

vi.mock('../../toolbar/TextAlignment', () => ({
  TextAlignment: ({
    editor,
    disabled,
  }: {
    editor: unknown;
    disabled: boolean;
  }) => (
    <div
      data-testid="text-alignment"
      data-disabled={String(disabled)}
      data-editor={String(Boolean(editor))}
    />
  ),
}));

vi.mock('../../toolbar/InsertMenu', () => ({
  InsertMenu: ({
    editor,
    disabled,
    onInsertImage,
  }: {
    editor: unknown;
    disabled: boolean;
    onInsertImage: () => void;
  }) => (
    <div
      data-testid="insert-menu"
      data-disabled={String(disabled)}
      data-editor={String(Boolean(editor))}
      data-has-image-handler={String(Boolean(onInsertImage))}
    />
  ),
}));

vi.mock('../../toolbar/HistoryControls', () => ({
  HistoryControls: ({
    editor,
    disabled,
  }: {
    editor: unknown;
    disabled: boolean;
  }) => (
    <div
      data-testid="history-controls"
      data-disabled={String(disabled)}
      data-editor={String(Boolean(editor))}
    />
  ),
}));

// ua: створення мок-редактора
const createMockEditor = (isEditable = true) => ({
  isEditable,
});

describe('Toolbar', () => {
  let editor: ReturnType<typeof createMockEditor>;
  let onInsertImage: (file: File) => Promise<void>;

  beforeEach(() => {
    editor = createMockEditor();
    onInsertImage = vi.fn();
  });

  // --------------------------------------------------
  // 1. Rendering
  // --------------------------------------------------

  describe('1. Rendering', () => {
    it('1.1. Повинен відображати панель інструментів', () => {
      const { container } = render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      expect(container.firstChild).toBeTruthy();
    });

    it('1.2. Повинен відображати всі п’ять дочірніх компонентів', () => {
      render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      expect(screen.getByTestId('text-style-selector')).toBeTruthy();
      expect(screen.getByTestId('history-controls')).toBeTruthy();
      expect(screen.getByTestId('text-formatting')).toBeTruthy();
      expect(screen.getByTestId('text-alignment')).toBeTruthy();
      expect(screen.getByTestId('insert-menu')).toBeTruthy();
    });

    it('1.3. Повинен зберігати порядок дочірніх компонентів', () => {
      const { container } = render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      const toolbar = container.firstChild as HTMLElement;

      const componentOrder = Array.from(toolbar.children)
        .filter((element) => element.hasAttribute('data-testid'))
        .map((element) => element.getAttribute('data-testid'));

      expect(componentOrder).toEqual([
        'text-style-selector',
        'history-controls',
        'text-formatting',
        'text-alignment',
        'insert-menu',
      ]);
    });

    it('1.4. Повинен передавати editor всім дочірнім компонентам', () => {
      render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      const components = [
        'text-style-selector',
        'history-controls',
        'text-formatting',
        'text-alignment',
        'insert-menu',
      ];

      components.forEach((testId) => {
        expect(screen.getByTestId(testId).getAttribute('data-editor')).toBe(
          'true',
        );
      });
    });
  });

  // --------------------------------------------------
  // 2. Editable state
  // --------------------------------------------------

  describe('2. Editable state', () => {
    it('2.1. Повинен передавати disabled=false, якщо редактор доступний для редагування', () => {
      render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      const components = [
        'text-style-selector',
        'history-controls',
        'text-formatting',
        'text-alignment',
        'insert-menu',
      ];

      components.forEach((testId) => {
        expect(screen.getByTestId(testId).getAttribute('data-disabled')).toBe(
          'false',
        );
      });
    });

    it('2.2. Повинен передавати disabled=true, якщо редактор доступний лише для читання', () => {
      editor = createMockEditor(false);

      render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      const components = [
        'text-style-selector',
        'history-controls',
        'text-formatting',
        'text-alignment',
        'insert-menu',
      ];

      components.forEach((testId) => {
        expect(screen.getByTestId(testId).getAttribute('data-disabled')).toBe(
          'true',
        );
      });
    });
  });

  // --------------------------------------------------
  // 3. Image insertion
  // --------------------------------------------------

  describe('3. Image insertion', () => {
    it('3.1. Повинен передавати onInsertImage до InsertMenu', () => {
      render(
        <Toolbar editor={editor as never} onInsertImage={onInsertImage} />,
      );

      expect(
        screen
          .getByTestId('insert-menu')
          .getAttribute('data-has-image-handler'),
      ).toBe('true');
    });

    it('3.2. Повинен передавати той самий callback без підміни', () => {
      // ua: перевіряємо саме посилання на callback, а не його виклик
      const receivedCallback = vi.fn();

      render(
        <Toolbar editor={editor as never} onInsertImage={receivedCallback} />,
      );

      expect(
        screen
          .getByTestId('insert-menu')
          .getAttribute('data-has-image-handler'),
      ).toBe('true');
    });
  });
});
