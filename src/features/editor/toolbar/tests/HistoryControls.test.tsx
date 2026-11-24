// ai tests for HistoryControls toolbar comp

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HistoryControls } from '../HistoryControls';
import { useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';

vi.mock('@tiptap/react', () => ({
  useEditorState: vi.fn(),
}));

describe('HistoryControls', () => {
  let editor: Editor;
  let chain: ReturnType<typeof vi.fn>;
  let focus: ReturnType<typeof vi.fn>;
  let undo: ReturnType<typeof vi.fn>;
  let redo: ReturnType<typeof vi.fn>;
  let run: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    run = vi.fn().mockReturnValue(true);
    undo = vi.fn().mockReturnValue({ run });
    redo = vi.fn().mockReturnValue({ run });

    focus = vi.fn().mockReturnValue({
      undo,
      redo,
    });

    chain = vi.fn().mockReturnValue({
      focus,
    });

    editor = {
      chain,
    } as unknown as Editor;

    vi.mocked(useEditorState).mockReturnValue({
      canUndo: true,
      canRedo: true,
    } as ReturnType<typeof useEditorState>);
  });

  describe('Відображення', () => {
    it('1.1. Повинен відображати кнопки Undo та Redo', () => {
      render(<HistoryControls editor={editor} />);

      expect(screen.getByRole('button', { name: 'Undo' })).toBeTruthy();

      expect(screen.getByRole('button', { name: 'Redo' })).toBeTruthy();
    });

    it('1.2. Повинен передавати editor у useEditorState', () => {
      render(<HistoryControls editor={editor} />);

      expect(useEditorState).toHaveBeenCalledWith(
        expect.objectContaining({
          editor,
          selector: expect.any(Function),
        }),
      );
    });

    it('1.3. Повинен мати відповідні підказки для кнопок', () => {
      render(<HistoryControls editor={editor} />);

      expect(screen.getByTitle('Undo (Ctrl+Z)')).toBeTruthy();

      expect(screen.getByTitle('Redo (Ctrl+Shift+Z)')).toBeTruthy();
    });
  });

  describe('Стан кнопок', () => {
    it('2.1. Повинен блокувати Undo, якщо canUndo дорівнює false', () => {
      vi.mocked(useEditorState).mockReturnValue({
        canUndo: false,
        canRedo: true,
      } as ReturnType<typeof useEditorState>);

      render(<HistoryControls editor={editor} />);

      expect(
        (screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);

      expect(
        (screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });

    it('2.2. Повинен блокувати Redo, якщо canRedo дорівнює false', () => {
      vi.mocked(useEditorState).mockReturnValue({
        canUndo: true,
        canRedo: false,
      } as ReturnType<typeof useEditorState>);

      render(<HistoryControls editor={editor} />);

      expect(
        (screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);

      expect(
        (screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });

    it('2.3. Повинен блокувати обидві кнопки, якщо disabled=true', () => {
      render(<HistoryControls editor={editor} disabled />);

      expect(
        (screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);

      expect(
        (screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });

    it('2.4. Повинен дозволяти обидві кнопки, якщо доступні Undo та Redo', () => {
      render(<HistoryControls editor={editor} disabled={false} />);

      expect(
        (screen.getByRole('button', { name: 'Undo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);

      expect(
        (screen.getByRole('button', { name: 'Redo' }) as HTMLButtonElement)
          .disabled,
      ).toBe(false);
    });
  });

  describe('Undo та Redo', () => {
    it('3.1. Повинен виконувати команду Undo через editor chain', () => {
      render(<HistoryControls editor={editor} />);

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

      expect(chain).toHaveBeenCalledTimes(1);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(undo).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledTimes(1);
      expect(redo).not.toHaveBeenCalled();
    });

    it('3.2. Повинен виконувати команду Redo через editor chain', () => {
      render(<HistoryControls editor={editor} />);

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }));

      expect(chain).toHaveBeenCalledTimes(1);
      expect(focus).toHaveBeenCalledTimes(1);
      expect(redo).toHaveBeenCalledTimes(1);
      expect(run).toHaveBeenCalledTimes(1);
      expect(undo).not.toHaveBeenCalled();
    });

    it('3.3. Не повинен виконувати Undo, якщо кнопка заблокована', () => {
      vi.mocked(useEditorState).mockReturnValue({
        canUndo: false,
        canRedo: true,
      } as ReturnType<typeof useEditorState>);

      render(<HistoryControls editor={editor} />);

      fireEvent.click(screen.getByRole('button', { name: 'Undo' }));

      expect(chain).not.toHaveBeenCalled();
      expect(undo).not.toHaveBeenCalled();
    });

    it('3.4. Не повинен виконувати Redo, якщо кнопка заблокована', () => {
      vi.mocked(useEditorState).mockReturnValue({
        canUndo: true,
        canRedo: false,
      } as ReturnType<typeof useEditorState>);

      render(<HistoryControls editor={editor} />);

      fireEvent.click(screen.getByRole('button', { name: 'Redo' }));

      expect(chain).not.toHaveBeenCalled();
      expect(redo).not.toHaveBeenCalled();
    });
  });
});
