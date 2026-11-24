// ai tests

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorState } from '@tiptap/react';
import { TextFormatting } from '../TextFormatting';
import type { EditorToolbarSectionProps } from '@/types/editor';

vi.mock('@tiptap/react', () => ({
  useEditorState: vi.fn(),
}));

type ActiveStates = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  highlight?: boolean;
  bulletList?: boolean;
  orderedList?: boolean;
};

const createEditor = (
  activeStates: ActiveStates = {},
  options: {
    textColor?: string;
    canExecute?: boolean;
  } = {},
) => {
  const run = vi.fn().mockReturnValue(true);

  // ua: усі команди TipTap повертають спільний chain-об'єкт
  const chainObject: Record<string, ReturnType<typeof vi.fn>> = {
    focus: vi.fn(),
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    toggleUnderline: vi.fn(),
    toggleStrike: vi.fn(),
    setColor: vi.fn(),
    unsetColor: vi.fn(),
    setHighlight: vi.fn(),
    unsetHighlight: vi.fn(),
    toggleBulletList: vi.fn(),
    toggleOrderedList: vi.fn(),
    run,
  };

  Object.values(chainObject).forEach((command) => {
    if (command !== run) {
      command.mockReturnValue(chainObject);
    }
  });

  const canExecute = options.canExecute ?? true;

  const can = {
    toggleBold: vi.fn().mockReturnValue(canExecute),
    toggleItalic: vi.fn().mockReturnValue(canExecute),
    toggleUnderline: vi.fn().mockReturnValue(canExecute),
    toggleStrike: vi.fn().mockReturnValue(canExecute),
    toggleBulletList: vi.fn().mockReturnValue(canExecute),
    toggleOrderedList: vi.fn().mockReturnValue(canExecute),
  };

  const editor = {
    isActive: vi.fn((name: string) => {
      return activeStates[name as keyof ActiveStates] ?? false;
    }),
    getAttributes: vi.fn().mockReturnValue({
      color: options.textColor ?? null,
    }),
    can: vi.fn().mockReturnValue(can),
    chain: vi.fn().mockReturnValue(chainObject),
  };

  return {
    editor: editor as unknown as EditorToolbarSectionProps['editor'],
    chainObject,
    can,
  };
};

describe('TextFormatting', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useEditorState).mockImplementation(
      ({ editor, selector }) => selector({ editor } as never) as never,
    );
  });

  it('1. Повинен відображати кнопки форматування тексту', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} />);

    expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Underline' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Strikethrough' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Bullet list' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Numbered list' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Text color' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Highlight text' })).toBeTruthy();
  });

  it('2. Повинен відображати активні стани форматування', () => {
    const { editor } = createEditor({
      bold: true,
      italic: true,
      underline: true,
      strike: true,
      bulletList: true,
      orderedList: true,
      highlight: true,
    });

    render(<TextFormatting editor={editor} />);

    const activeButtons = [
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Bullet list',
      'Numbered list',
      'Highlight text',
    ];

    activeButtons.forEach((label) => {
      expect(
        screen
          .getByRole('button', { name: label })
          .getAttribute('aria-pressed'),
      ).toBe('true');
    });
  });

  it('3. Повинен визначати активний колір тексту', () => {
    const { editor } = createEditor({}, { textColor: '#2563EB' });

    render(<TextFormatting editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Text color' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('4. Повинен визначати відсутність активного кольору тексту', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Text color' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it.each([
    ['Bold', 'toggleBold'],
    ['Italic', 'toggleItalic'],
    ['Underline', 'toggleUnderline'],
    ['Strikethrough', 'toggleStrike'],
    ['Bullet list', 'toggleBulletList'],
    ['Numbered list', 'toggleOrderedList'],
  ])('5. Повинен застосовувати форматування: %s', (label, command) => {
    const { editor, chainObject } = createEditor();

    render(<TextFormatting editor={editor} />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(editor.chain).toHaveBeenCalledTimes(1);
    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject[command]).toHaveBeenCalledTimes(1);
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('6. Повинен вимикати команди форматування, якщо вони недоступні в editor.can()', () => {
    const { editor } = createEditor({}, { canExecute: false });

    render(<TextFormatting editor={editor} />);

    const disabledButtons = [
      'Bold',
      'Italic',
      'Underline',
      'Strikethrough',
      'Bullet list',
      'Numbered list',
    ];

    disabledButtons.forEach((label) => {
      expect(
        (screen.getByRole('button', { name: label }) as HTMLButtonElement)
          .disabled,
      ).toBe(true);
    });
  });

  it('7. Повинен вимикати всі кнопки, якщо disabled дорівнює true', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} disabled />);

    screen.getAllByRole('button').forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('8. Повинен застосовувати вибраний колір тексту', () => {
    const { editor, chainObject } = createEditor();

    render(<TextFormatting editor={editor} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Set text color #2563EB' }),
    );

    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject.setColor).toHaveBeenCalledWith('#2563EB');
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('9. Повинен відображати всі доступні кольори тексту', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} />);

    const colors = [
      '#000000',
      '#6B7280',
      '#DC2626',
      '#EA580C',
      '#CA8A04',
      '#16A34A',
      '#2563EB',
      '#9333EA',
    ];

    colors.forEach((color) => {
      expect(
        screen.getByRole('button', { name: `Set text color ${color}` }),
      ).toBeTruthy();
    });
  });

  it('10. Повинен видаляти колір тексту', () => {
    const { editor, chainObject } = createEditor();

    render(<TextFormatting editor={editor} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove color' }));

    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject.unsetColor).toHaveBeenCalledTimes(1);
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('11. Повинен застосовувати вибраний колір підсвічування', () => {
    const { editor, chainObject } = createEditor();

    render(<TextFormatting editor={editor} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Highlight with #FEF08A' }),
    );

    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject.setHighlight).toHaveBeenCalledWith({
      color: '#FEF08A',
    });
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('12. Повинен відображати всі доступні кольори підсвічування', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} />);

    const colors = [
      '#FEF08A',
      '#BBF7D0',
      '#BFDBFE',
      '#E9D5FF',
      '#FBCFE8',
      '#FED7AA',
    ];

    colors.forEach((color) => {
      expect(
        screen.getByRole('button', { name: `Highlight with ${color}` }),
      ).toBeTruthy();
    });
  });

  it('13. Повинен видаляти підсвічування тексту', () => {
    const { editor, chainObject } = createEditor();

    render(<TextFormatting editor={editor} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove highlight' }));

    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject.unsetHighlight).toHaveBeenCalledTimes(1);
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('14. Повинен вимикати вибір кольору тексту, якщо disabled дорівнює true', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} disabled />);

    expect(
      (screen.getByRole('button', { name: 'Text color' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    expect(
      (
        screen.getByRole('button', {
          name: 'Set text color #2563EB',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    expect(
      (
        screen.getByRole('button', {
          name: 'Remove color',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it('15. Повинен вимикати вибір кольору підсвічування, якщо disabled дорівнює true', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} disabled />);

    expect(
      (
        screen.getByRole('button', {
          name: 'Highlight text',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    expect(
      (
        screen.getByRole('button', {
          name: 'Highlight with #FEF08A',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);

    expect(
      (
        screen.getByRole('button', {
          name: 'Remove highlight',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it('16. Повинен передавати editor до useEditorState', () => {
    const { editor } = createEditor();

    render(<TextFormatting editor={editor} />);

    expect(useEditorState).toHaveBeenCalledWith(
      expect.objectContaining({ editor }),
    );
  });
});
