// ai tests

import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorState } from '@tiptap/react';
import { TextAlignment } from '../TextAlignment';
import type { EditorToolbarSectionProps } from '@/types/editor';

vi.mock('@tiptap/react', () => ({
  useEditorState: vi.fn(),
}));

type MockEditor = {
  isActive: ReturnType<typeof vi.fn>;
  chain: ReturnType<typeof vi.fn>;
};

const createEditor = (activeAlignment = 'left') => {
  const chainObject = {
    focus: vi.fn(),
    setTextAlign: vi.fn(),
    run: vi.fn().mockReturnValue(true),
  };

  chainObject.focus.mockReturnValue(chainObject);
  chainObject.setTextAlign.mockReturnValue(chainObject);

  const editor: MockEditor = {
    isActive: vi.fn((attributes: { textAlign?: string }) => {
      return attributes.textAlign === activeAlignment;
    }),
    chain: vi.fn().mockReturnValue(chainObject),
  };

  return {
    editor: editor as unknown as EditorToolbarSectionProps['editor'],
    chainObject,
  };
};

describe('TextAlignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useEditorState).mockImplementation(
      ({ editor, selector }) => selector({ editor } as never) as never,
    );
  });

  it('1. Повинен відображати всі кнопки вирівнювання', () => {
    const { editor } = createEditor();

    render(<TextAlignment editor={editor} />);

    expect(screen.getByRole('button', { name: 'Align left' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Align center' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Align right' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Justify' })).toBeTruthy();
  });

  it('2. Повинен встановлювати вирівнювання ліворуч за замовчуванням', () => {
    const { editor } = createEditor();

    render(<TextAlignment editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Align left' })
        .getAttribute('aria-pressed'),
    ).toBe('true');

    expect(
      screen
        .getByRole('button', { name: 'Align center' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('3. Повинен визначати активне вирівнювання по центру', () => {
    const { editor } = createEditor('center');

    render(<TextAlignment editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Align center' })
        .getAttribute('aria-pressed'),
    ).toBe('true');

    expect(
      screen
        .getByRole('button', { name: 'Align left' })
        .getAttribute('aria-pressed'),
    ).toBe('false');
  });

  it('4. Повинен визначати активне вирівнювання праворуч', () => {
    const { editor } = createEditor('right');

    render(<TextAlignment editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Align right' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it('5. Повинен визначати активне вирівнювання Justify', () => {
    const { editor } = createEditor('justify');

    render(<TextAlignment editor={editor} />);

    expect(
      screen
        .getByRole('button', { name: 'Justify' })
        .getAttribute('aria-pressed'),
    ).toBe('true');
  });

  it.each([
    ['Align left', 'left'],
    ['Align center', 'center'],
    ['Align right', 'right'],
    ['Justify', 'justify'],
  ])('6. Повинен застосовувати вирівнювання: %s', (label, alignment) => {
    const { editor, chainObject } = createEditor();

    render(<TextAlignment editor={editor} />);

    fireEvent.click(screen.getByRole('button', { name: label }));

    expect(editor.chain).toHaveBeenCalledTimes(1);
    expect(chainObject.focus).toHaveBeenCalledTimes(1);
    expect(chainObject.setTextAlign).toHaveBeenCalledWith(alignment);
    expect(chainObject.run).toHaveBeenCalledTimes(1);
  });

  it('7. Повинен вимикати всі кнопки, якщо disabled дорівнює true', () => {
    const { editor } = createEditor();

    render(<TextAlignment editor={editor} disabled />);

    const buttons = screen.getAllByRole('button');

    expect(buttons).toHaveLength(4);

    buttons.forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
  });

  it('8. Повинен залишати кнопки доступними, якщо disabled не переданий', () => {
    const { editor } = createEditor();

    render(<TextAlignment editor={editor} />);

    screen.getAllByRole('button').forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });
  });
});
