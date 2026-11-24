import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { EditorBubbleMenu } from '../EditorBubbleMenu';

// ua: мок BubbleMenu без залежності від внутрішньої реалізації Tiptap
vi.mock('@tiptap/react/menus', () => ({
  BubbleMenu: ({
    children,
    shouldShow,
  }: {
    children: React.ReactNode;
    shouldShow: () => boolean;
  }) => (
    <div data-testid="bubble-menu" data-should-show={String(shouldShow())}>
      {children}
    </div>
  ),
}));

// ua: мок іконок Font Awesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="font-awesome-icon" />,
}));

// ua: створення мок-редактора з усіма командами форматування
const createMockEditor = () => {
  const chain = {
    focus: vi.fn(),
    toggleBold: vi.fn(),
    toggleItalic: vi.fn(),
    toggleUnderline: vi.fn(),
    toggleStrike: vi.fn(),
    toggleHeading: vi.fn(),
    extendMarkRange: vi.fn(),
    unsetLink: vi.fn(),
    setLink: vi.fn(),
    setColor: vi.fn(),
    unsetColor: vi.fn(),
    setHighlight: vi.fn(),
    unsetHighlight: vi.fn(),
    run: vi.fn(),
  };

  // ua: кожна команда повертає той самий об'єкт для підтримки chain API
  Object.values(chain).forEach((method) => {
    if (method !== chain.run) {
      method.mockReturnValue(chain);
    }
  });

  return {
    isEditable: true,
    state: {
      selection: {
        empty: false,
        $from: {
          parent: {
            isTextblock: true,
          },
        },
      },
    },
    isActive: vi.fn().mockReturnValue(false),
    getAttributes: vi.fn().mockReturnValue({}),
    chain: vi.fn(() => chain),
    __chain: chain,
  };
};

describe('EditorBubbleMenu', () => {
  let editor: ReturnType<typeof createMockEditor>;

  beforeEach(() => {
    editor = createMockEditor();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --------------------------------------------------
  // 1. Rendering
  // --------------------------------------------------

  describe('1. Rendering', () => {
    it('1.1. Повинен відображати контекстне меню', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(screen.getByTestId('bubble-menu')).toBeTruthy();
    });

    it('1.2. Повинен відображати кнопки базового форматування', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(screen.getByRole('button', { name: 'Bold' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Italic' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Underline' })).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Strikethrough' }),
      ).toBeTruthy();
    });

    it('1.3. Повинен відображати кнопки заголовків H1–H3', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(screen.getByRole('button', { name: 'Heading 1' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Heading 2' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Heading 3' })).toBeTruthy();
    });

    it('1.4. Повинен відображати кнопку додавання посилання', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByRole('button', { name: 'Add or edit link' }),
      ).toBeTruthy();
    });

    it('1.5. Повинен відображати всі кольори тексту', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      const colors = [
        '#000000',
        '#DC2626',
        '#EA580C',
        '#16A34A',
        '#2563EB',
        '#9333EA',
      ];

      colors.forEach((color) => {
        expect(
          screen.getByRole('button', { name: `Text color ${color}` }),
        ).toBeTruthy();
      });
    });

    it('1.6. Повинен відображати кнопку очищення кольору тексту', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByRole('button', { name: 'Clear text color' }),
      ).toBeTruthy();
    });

    it('1.7. Повинен відображати всі кольори підсвічування', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      const colors = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'];

      colors.forEach((color) => {
        expect(
          screen.getByRole('button', { name: `Highlight ${color}` }),
        ).toBeTruthy();
      });
    });

    it('1.8. Повинен відображати кнопку видалення підсвічування', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByRole('button', { name: 'Remove highlight' }),
      ).toBeTruthy();
    });

    it('1.9. Повинен показувати активний стан кнопок форматування', () => {
      editor.isActive.mockImplementation((type) => type === 'bold');

      render(<EditorBubbleMenu editor={editor as never} />);

      const boldButton = screen.getByRole('button', { name: 'Bold' });

      expect(boldButton.className).toContain('bg-primary/15');
      expect(boldButton.className).toContain('text-primary');
    });

    it('1.10. Повинен показувати активний стан заголовка', () => {
      editor.isActive.mockImplementation(
        (type, attributes) => type === 'heading' && attributes?.level === 2,
      );

      render(<EditorBubbleMenu editor={editor as never} />);

      const headingButton = screen.getByRole('button', {
        name: 'Heading 2',
      });

      expect(headingButton.className).toContain('bg-primary/15');
    });
  });

  // --------------------------------------------------
  // 2. Visibility
  // --------------------------------------------------

  describe('2. Visibility', () => {
    it('2.1. Повинен показувати меню для редагованого виділеного тексту', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByTestId('bubble-menu').getAttribute('data-should-show'),
      ).toBe('true');
    });

    it('2.2. Не повинен показувати меню, якщо редактор недоступний для редагування', () => {
      editor.isEditable = false;

      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByTestId('bubble-menu').getAttribute('data-should-show'),
      ).toBe('false');
    });

    it('2.3. Не повинен показувати меню, якщо виділення порожнє', () => {
      editor.state.selection.empty = true;

      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByTestId('bubble-menu').getAttribute('data-should-show'),
      ).toBe('false');
    });

    it('2.4. Не повинен показувати меню, якщо виділений елемент не є текстовим блоком', () => {
      editor.state.selection.$from.parent.isTextblock = false;

      render(<EditorBubbleMenu editor={editor as never} />);

      expect(
        screen.getByTestId('bubble-menu').getAttribute('data-should-show'),
      ).toBe('false');
    });
  });

  // --------------------------------------------------
  // 3. Basic formatting
  // --------------------------------------------------

  describe('3. Basic formatting', () => {
    it('3.1. Повинен перемикати Bold', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Bold' }));

      expect(editor.chain).toHaveBeenCalled();
      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.toggleBold).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });

    it('3.2. Повинен перемикати Italic', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Italic' }));

      expect(editor.__chain.toggleItalic).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });

    it('3.3. Повинен перемикати Underline', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Underline' }));

      expect(editor.__chain.toggleUnderline).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });

    it('3.4. Повинен перемикати Strikethrough', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Strikethrough' }));

      expect(editor.__chain.toggleStrike).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // 4. Headings
  // --------------------------------------------------

  describe('4. Headings', () => {
    it.each([1, 2, 3])('4.%s. Повинен перемикати заголовок H%s', (level) => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: `Heading ${level}` }));

      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.toggleHeading).toHaveBeenCalledWith({ level });
      expect(editor.__chain.run).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // 5. Links
  // --------------------------------------------------

  describe('5. Links', () => {
    it('5.1. Повинен встановлювати нове посилання', () => {
      const promptMock = vi.fn().mockReturnValue('https://example.com');
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(promptMock).toHaveBeenCalledWith('Enter URL:', '');
      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.extendMarkRange).toHaveBeenCalledWith('link');
      expect(editor.__chain.setLink).toHaveBeenCalledWith({
        href: 'https://example.com',
      });
      expect(editor.__chain.run).toHaveBeenCalled();
    });

    it('5.2. Повинен передавати поточне посилання у prompt', () => {
      editor.getAttributes.mockReturnValue({
        href: 'https://previous.com',
      });

      const promptMock = vi.fn().mockReturnValue('https://updated.com');
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(promptMock).toHaveBeenCalledWith(
        'Enter URL:',
        'https://previous.com',
      );
    });

    it('5.3. Повинен скасовувати зміну посилання, якщо prompt повертає null', () => {
      const promptMock = vi.fn().mockReturnValue(null);
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(editor.chain).not.toHaveBeenCalled();
    });

    it('5.4. Повинен видаляти посилання, якщо введено порожній рядок', () => {
      const promptMock = vi.fn().mockReturnValue('');
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.extendMarkRange).toHaveBeenCalledWith('link');
      expect(editor.__chain.unsetLink).toHaveBeenCalled();
      expect(editor.__chain.setLink).not.toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });

    it('5.5. Повинен видаляти посилання, якщо введено лише пробіли', () => {
      const promptMock = vi.fn().mockReturnValue('   ');
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(editor.__chain.unsetLink).toHaveBeenCalled();
      expect(editor.__chain.setLink).not.toHaveBeenCalled();
    });

    it('5.6. Повинен обрізати пробіли навколо URL', () => {
      const promptMock = vi.fn().mockReturnValue('  https://example.com  ');
      vi.stubGlobal('prompt', promptMock);

      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add or edit link' }));

      expect(editor.__chain.setLink).toHaveBeenCalledWith({
        href: 'https://example.com',
      });
    });
  });

  // --------------------------------------------------
  // 6. Text colors
  // --------------------------------------------------

  describe('6. Text colors', () => {
    it.each(['#000000', '#DC2626', '#EA580C', '#16A34A', '#2563EB', '#9333EA'])(
      '6.1. Повинен встановлювати колір тексту %s',
      (color) => {
        render(<EditorBubbleMenu editor={editor as never} />);

        fireEvent.click(
          screen.getByRole('button', { name: `Text color ${color}` }),
        );

        expect(editor.__chain.focus).toHaveBeenCalled();
        expect(editor.__chain.setColor).toHaveBeenCalledWith(color);
        expect(editor.__chain.run).toHaveBeenCalled();
      },
    );

    it('6.2. Повинен очищати колір тексту', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Clear text color' }));

      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.unsetColor).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // 7. Highlights
  // --------------------------------------------------

  describe('7. Highlights', () => {
    it.each(['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'])(
      '7.1. Повинен встановлювати підсвічування %s',
      (color) => {
        render(<EditorBubbleMenu editor={editor as never} />);

        fireEvent.click(
          screen.getByRole('button', { name: `Highlight ${color}` }),
        );

        expect(editor.__chain.focus).toHaveBeenCalled();
        expect(editor.__chain.setHighlight).toHaveBeenCalledWith({ color });
        expect(editor.__chain.run).toHaveBeenCalled();
      },
    );

    it('7.2. Повинен видаляти підсвічування', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      fireEvent.click(screen.getByRole('button', { name: 'Remove highlight' }));

      expect(editor.__chain.focus).toHaveBeenCalled();
      expect(editor.__chain.unsetHighlight).toHaveBeenCalled();
      expect(editor.__chain.run).toHaveBeenCalled();
    });
  });

  // --------------------------------------------------
  // 8. Mouse interaction
  // --------------------------------------------------

  describe('8. Mouse interaction', () => {
    it('8.1. Повинен запобігати втраті виділення при натисканні на кнопку форматування', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      const button = screen.getByRole('button', { name: 'Bold' });
      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('8.2. Повинен запобігати втраті виділення при натисканні на колір тексту', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      const button = screen.getByRole('button', {
        name: 'Text color #DC2626',
      });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('8.3. Повинен запобігати втраті виділення при натисканні на заголовок', () => {
      render(<EditorBubbleMenu editor={editor as never} />);

      const button = screen.getByRole('button', {
        name: 'Heading 1',
      });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });
});
