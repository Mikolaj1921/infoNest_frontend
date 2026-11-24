// ai tests

import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Editor } from '@tiptap/react';

import { InsertMenu } from '../InsertMenu';

describe('InsertMenu', () => {
  let editor: Editor;
  let onInsertImage: (file: File) => Promise<void>;

  let can: ReturnType<typeof vi.fn>;
  let chain: ReturnType<typeof vi.fn>;

  let focus: ReturnType<typeof vi.fn>;
  let toggleBlockquote: ReturnType<typeof vi.fn>;
  let toggleCodeBlock: ReturnType<typeof vi.fn>;
  let setHorizontalRule: ReturnType<typeof vi.fn>;
  let insertTable: ReturnType<typeof vi.fn>;
  let addRowAfter: ReturnType<typeof vi.fn>;
  let addColumnAfter: ReturnType<typeof vi.fn>;
  let deleteRow: ReturnType<typeof vi.fn>;
  let deleteColumn: ReturnType<typeof vi.fn>;
  let deleteTable: ReturnType<typeof vi.fn>;
  let run: ReturnType<typeof vi.fn>;

  const createEditor = (insideTable = false) => {
    run = vi.fn().mockReturnValue(true);

    // ua: усі команди TipTap повертають спільний chain-об'єкт,
    // щоб після кожної команди можна було викликати наступну та run().
    const chainObject: Record<string, ReturnType<typeof vi.fn>> = {};

    toggleBlockquote = vi.fn().mockImplementation(() => chainObject);
    toggleCodeBlock = vi.fn().mockImplementation(() => chainObject);
    setHorizontalRule = vi.fn().mockImplementation(() => chainObject);
    insertTable = vi.fn().mockImplementation(() => chainObject);
    addRowAfter = vi.fn().mockImplementation(() => chainObject);
    addColumnAfter = vi.fn().mockImplementation(() => chainObject);
    deleteRow = vi.fn().mockImplementation(() => chainObject);
    deleteColumn = vi.fn().mockImplementation(() => chainObject);
    deleteTable = vi.fn().mockImplementation(() => chainObject);

    focus = vi.fn().mockImplementation(() => chainObject);

    Object.assign(chainObject, {
      focus,
      toggleBlockquote,
      toggleCodeBlock,
      setHorizontalRule,
      insertTable,
      addRowAfter,
      addColumnAfter,
      deleteRow,
      deleteColumn,
      deleteTable,
      run,
    });

    chain = vi.fn().mockReturnValue(chainObject);

    const canMethods = {
      toggleBlockquote: vi.fn().mockReturnValue(true),
      toggleCodeBlock: vi.fn().mockReturnValue(true),
      setHorizontalRule: vi.fn().mockReturnValue(true),
      insertTable: vi.fn().mockReturnValue(true),
      addRowAfter: vi.fn().mockReturnValue(true),
      addColumnAfter: vi.fn().mockReturnValue(true),
      deleteRow: vi.fn().mockReturnValue(true),
      deleteColumn: vi.fn().mockReturnValue(true),
      deleteTable: vi.fn().mockReturnValue(true),
    };

    can = vi.fn().mockReturnValue(canMethods);

    editor = {
      can,
      chain,
      isActive: vi.fn().mockReturnValue(insideTable),
    } as unknown as Editor;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    createEditor();
    onInsertImage = vi
      .fn<(file: File) => Promise<void>>()
      .mockResolvedValue(undefined);
  });

  describe('Відображення', () => {
    it('1.1. Повинен відображати основні кнопки вставлення', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(
        screen.getByRole('button', { name: 'Insert blockquote' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Insert code block' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Insert horizontal rule' }),
      ).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Insert image' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Insert table' })).toBeTruthy();
    });

    it('1.2. Повинен відображати приховане поле вибору зображення', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const input = document.querySelector('input[type="file"]');

      expect(input).toBeTruthy();
      expect((input as HTMLInputElement).accept).toBe(
        'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
      );
    });

    it('1.3. Повинен перевіряти, чи редактор знаходиться всередині таблиці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(editor.isActive).toHaveBeenCalledWith('table');
    });

    it('1.4. Не повинен показувати операції з таблицею поза таблицею', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(
        screen.queryByRole('button', { name: 'Add row below' }),
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Add column after' }),
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Delete current row' }),
      ).toBeNull();
      expect(
        screen.queryByRole('button', { name: 'Delete current column' }),
      ).toBeNull();
      expect(screen.queryByRole('button', { name: 'Delete table' })).toBeNull();
    });

    it('1.5. Повинен показувати операції з таблицею, якщо редактор всередині таблиці', () => {
      createEditor(true);

      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(
        screen.getByRole('button', { name: 'Add row below' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Add column after' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Delete current row' }),
      ).toBeTruthy();
      expect(
        screen.getByRole('button', { name: 'Delete current column' }),
      ).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Delete table' })).toBeTruthy();
    });
  });

  describe('Стан disabled', () => {
    it('2.1. Повинен блокувати всі основні кнопки, якщо disabled=true', () => {
      render(
        <InsertMenu editor={editor} onInsertImage={onInsertImage} disabled />,
      );

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert blockquote',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert code block',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert horizontal rule',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert image',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert table',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    it('2.2. Повинен враховувати доступність команд редактора', () => {
      const canMethods = {
        toggleBlockquote: vi.fn().mockReturnValue(false),
        toggleCodeBlock: vi.fn().mockReturnValue(false),
        setHorizontalRule: vi.fn().mockReturnValue(false),
        insertTable: vi.fn().mockReturnValue(false),
      };

      can = vi.fn().mockReturnValue(canMethods);

      editor = {
        can,
        chain,
        isActive: vi.fn().mockReturnValue(false),
      } as unknown as Editor;

      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert blockquote',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert code block',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert horizontal rule',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert table',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    it('2.3. Повинен блокувати операції з таблицею, якщо disabled=true', () => {
      createEditor(true);

      render(
        <InsertMenu editor={editor} onInsertImage={onInsertImage} disabled />,
      );

      const titles = [
        'Add row below',
        'Add column after',
        'Delete current row',
        'Delete current column',
        'Delete table',
      ];

      titles.forEach((title) => {
        expect(
          (screen.getByRole('button', { name: title }) as HTMLButtonElement)
            .disabled,
        ).toBe(true);
      });
    });
  });

  describe('Блокові елементи', () => {
    it('3.1. Повинен вставляти Blockquote', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Insert blockquote' }),
      );

      expect(chain).toHaveBeenCalled();
      expect(focus).toHaveBeenCalled();
      expect(toggleBlockquote).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('3.2. Повинен вставляти Code Block', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Insert code block' }),
      );

      expect(toggleCodeBlock).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('3.3. Повинен вставляти Horizontal Rule', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Insert horizontal rule' }),
      );

      expect(setHorizontalRule).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });
  });

  describe('Вставлення зображень', () => {
    it('4.1. Повинен відкривати системний вибір файлу після натискання Image', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

      fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));

      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('4.2. Повинен передавати вибране зображення в onInsertImage', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const file = new File(['image'], 'photo.png', {
        type: 'image/png',
      });

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(input, {
        target: {
          files: [file],
        },
      });

      expect(onInsertImage).toHaveBeenCalledWith(file);
    });

    it('4.3. Повинен очищати input після вибору файлу', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const file = new File(['image'], 'photo.png', {
        type: 'image/png',
      });

      fireEvent.change(input, {
        target: {
          files: [file],
        },
      });

      expect(input.value).toBe('');
    });

    it('4.4. Не повинен викликати onInsertImage, якщо файл не вибрано', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      fireEvent.change(input, {
        target: {
          files: [],
        },
      });

      expect(onInsertImage).not.toHaveBeenCalled();
    });

    it('4.5. Повинен блокувати відкриття вибору файлу, якщо disabled=true', () => {
      render(
        <InsertMenu editor={editor} onInsertImage={onInsertImage} disabled />,
      );

      const input = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;

      const clickSpy = vi.spyOn(input, 'click').mockImplementation(() => {});

      fireEvent.click(screen.getByRole('button', { name: 'Insert image' }));

      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Вибір розміру таблиці', () => {
    it('5.1. Повинен відкривати та закривати вибір розміру таблиці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const tableButton = screen.getByRole('button', {
        name: 'Insert table',
      });

      fireEvent.click(tableButton);

      expect(screen.getByText('Select table size')).toBeTruthy();

      fireEvent.click(tableButton);

      expect(screen.queryByText('Select table size')).toBeNull();
    });

    it('5.2. Повинен відображати сітку 6 × 6', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      for (let row = 1; row <= 6; row += 1) {
        for (let col = 1; col <= 6; col += 1) {
          expect(
            screen.getByRole('button', {
              name: `${row} rows by ${col} columns`,
            }),
          ).toBeTruthy();
        }
      }
    });

    it('5.3. Повинен відображати початковий розмір таблиці 1 × 1', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      expect(screen.getByText('1 × 1')).toBeTruthy();
    });

    it('5.4. Повинен оновлювати розмір таблиці при наведенні на клітинку', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      fireEvent.mouseEnter(
        screen.getByRole('button', {
          name: '3 rows by 4 columns',
        }),
      );

      expect(screen.getByText('3 × 4')).toBeTruthy();
    });

    it('5.5. Повинен оновлювати розмір таблиці при фокусуванні на клітинці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      fireEvent.focus(
        screen.getByRole('button', {
          name: '2 rows by 5 columns',
        }),
      );

      expect(screen.getByText('2 × 5')).toBeTruthy();
    });

    it('5.6. Повинен вставляти таблицю вибраного розміру', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      fireEvent.mouseEnter(
        screen.getByRole('button', {
          name: '3 rows by 4 columns',
        }),
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: '3 rows by 4 columns',
        }),
      );

      expect(chain).toHaveBeenCalled();
      expect(focus).toHaveBeenCalled();
      expect(insertTable).toHaveBeenCalledWith({
        rows: 3,
        cols: 4,
        withHeaderRow: true,
      });

      expect(run).toHaveBeenCalled();
    });

    it('5.7. Повинен закривати вибір розміру після вставлення таблиці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      fireEvent.click(
        screen.getByRole('button', {
          name: '2 rows by 2 columns',
        }),
      );

      expect(screen.queryByText('Select table size')).toBeNull();
    });

    it('5.8. Повинен скидати розмір до 1 × 1 після вставлення таблиці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      fireEvent.mouseEnter(
        screen.getByRole('button', {
          name: '4 rows by 3 columns',
        }),
      );

      fireEvent.click(
        screen.getByRole('button', {
          name: '4 rows by 3 columns',
        }),
      );

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      expect(screen.getByText('1 × 1')).toBeTruthy();
    });

    it('5.9. Не повинен вставляти таблицю, якщо editor.can().insertTable() повертає false', () => {
      const canMethods = {
        toggleBlockquote: vi.fn().mockReturnValue(true),
        toggleCodeBlock: vi.fn().mockReturnValue(true),
        setHorizontalRule: vi.fn().mockReturnValue(true),
        insertTable: vi.fn().mockReturnValue(false),
      };

      can = vi.fn().mockReturnValue(canMethods);

      editor = {
        can,
        chain,
        isActive: vi.fn().mockReturnValue(false),
      } as unknown as Editor;

      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      expect(
        (
          screen.getByRole('button', {
            name: 'Insert table',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(insertTable).not.toHaveBeenCalled();
    });
  });

  describe('Операції з таблицею', () => {
    beforeEach(() => {
      createEditor(true);
    });

    it('6.1. Повинен додавати рядок нижче', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add row below' }));

      expect(addRowAfter).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('6.2. Повинен додавати стовпець після поточного', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Add column after' }));

      expect(addColumnAfter).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('6.3. Повинен видаляти поточний рядок', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Delete current row' }),
      );

      expect(deleteRow).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('6.4. Повинен видаляти поточний стовпець', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(
        screen.getByRole('button', { name: 'Delete current column' }),
      );

      expect(deleteColumn).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('6.5. Повинен видаляти таблицю', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Delete table' }));

      expect(deleteTable).toHaveBeenCalled();
      expect(run).toHaveBeenCalled();
    });

    it('6.6. Повинен враховувати доступність команд роботи з таблицею', () => {
      const canMethods = {
        toggleBlockquote: vi.fn().mockReturnValue(true),
        toggleCodeBlock: vi.fn().mockReturnValue(true),
        setHorizontalRule: vi.fn().mockReturnValue(true),
        insertTable: vi.fn().mockReturnValue(true),
        addRowAfter: vi.fn().mockReturnValue(false),
        addColumnAfter: vi.fn().mockReturnValue(false),
        deleteRow: vi.fn().mockReturnValue(false),
        deleteColumn: vi.fn().mockReturnValue(false),
        deleteTable: vi.fn().mockReturnValue(false),
      };

      editor = {
        can: vi.fn().mockReturnValue(canMethods),
        chain,
        isActive: vi.fn().mockReturnValue(true),
      } as unknown as Editor;

      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const titles = [
        'Add row below',
        'Add column after',
        'Delete current row',
        'Delete current column',
        'Delete table',
      ];

      titles.forEach((title) => {
        expect(
          (screen.getByRole('button', { name: title }) as HTMLButtonElement)
            .disabled,
        ).toBe(true);
      });
    });
  });

  describe('Запобігання втраті фокусу редактора', () => {
    it('7.1. Повинен запобігати втраті фокусу при натисканні InsertButton', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      const button = screen.getByRole('button', {
        name: 'Insert blockquote',
      });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      button.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });

    it('7.2. Повинен запобігати втраті фокусу при натисканні на клітинку таблиці', () => {
      render(<InsertMenu editor={editor} onInsertImage={onInsertImage} />);

      fireEvent.click(screen.getByRole('button', { name: 'Insert table' }));

      const cell = screen.getByRole('button', {
        name: '2 rows by 2 columns',
      });

      const event = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
      });

      cell.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(true);
    });
  });
});
