// ai tests for editorExtensions.ts

import { describe, it, expect } from 'vitest';

import { editorExtensions } from './editorExtensions';

describe('editorExtensions', () => {
  // ua: пошук розширення за його назвою
  const getExtension = (name: string) =>
    editorExtensions.find((extension) => extension.name === name);

  // --------------------------------------------------
  // 1. Extensions registration
  // --------------------------------------------------

  describe('1. Extensions registration', () => {
    it('1.1. Повинен містити всі необхідні розширення редактора', () => {
      const expectedExtensions = [
        'starterKit',
        'paragraphStyle',
        'placeholder',
        'image',
        'textAlign',
        'textStyle',
        'color',
        'highlight',
        'tableKit',
      ];

      expectedExtensions.forEach((name) => {
        expect(getExtension(name)).toBeTruthy();
      });
    });

    it('1.2. Не повинен містити дублікати розширень', () => {
      const names = editorExtensions.map((extension) => extension.name);

      expect(new Set(names).size).toBe(names.length);
    });

    it('1.3. Повинен реєструвати ParagraphStyle', () => {
      const paragraphStyle = getExtension('paragraphStyle');

      expect(paragraphStyle).toBeTruthy();
      expect(paragraphStyle?.name).toBe('paragraphStyle');
    });
  });

  // --------------------------------------------------
  // 2. StarterKit
  // --------------------------------------------------

  describe('2. StarterKit', () => {
    it('2.1. Повинен підтримувати заголовки від H1 до H6', () => {
      const starterKit = getExtension('starterKit');

      expect(starterKit?.options.heading.levels).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  // --------------------------------------------------
  // 3. Placeholder
  // --------------------------------------------------

  describe('3. Placeholder', () => {
    it('3.1. Повинен містити правильний текст підказки', () => {
      const placeholder = getExtension('placeholder');

      expect(placeholder?.options.placeholder).toBe(
        'Please start typing your text here...',
      );
    });

    it('3.2. Повинен використовувати клас порожнього редактора', () => {
      const placeholder = getExtension('placeholder');

      expect(placeholder?.options.emptyEditorClass).toBe('is-editor-empty');
    });
  });

  // --------------------------------------------------
  // 4. Image
  // --------------------------------------------------

  describe('4. Image', () => {
    it('4.1. Повинен забороняти inline-зображення', () => {
      const image = getExtension('image');

      expect(image?.options.inline).toBe(false);
    });

    it('4.2. Повинен забороняти Base64-зображення', () => {
      const image = getExtension('image');

      expect(image?.options.allowBase64).toBe(false);
    });

    it('4.3. Повинен містити CSS-класи для зображень', () => {
      const image = getExtension('image');

      expect(image?.options.HTMLAttributes.class).toContain('max-w-full');
      expect(image?.options.HTMLAttributes.class).toContain('rounded-xl');
      expect(image?.options.HTMLAttributes.class).toContain('mx-auto');
    });
  });

  // --------------------------------------------------
  // 5. Text alignment
  // --------------------------------------------------

  describe('5. Text alignment', () => {
    it('5.1. Повинен підтримувати вирівнювання абзаців і заголовків', () => {
      const textAlign = getExtension('textAlign');

      expect(textAlign?.options.types).toEqual(['heading', 'paragraph']);
    });

    it('5.2. Повинен підтримувати всі чотири варіанти вирівнювання', () => {
      const textAlign = getExtension('textAlign');

      expect(textAlign?.options.alignments).toEqual([
        'left',
        'center',
        'right',
        'justify',
      ]);
    });

    it('5.3. Повинен використовувати left як вирівнювання за замовчуванням', () => {
      const textAlign = getExtension('textAlign');

      expect(textAlign?.options.defaultAlignment).toBe('left');
    });
  });

  // --------------------------------------------------
  // 6. Highlight
  // --------------------------------------------------

  describe('6. Highlight', () => {
    it('6.1. Повинен підтримувати різнокольорове виділення тексту', () => {
      const highlight = getExtension('highlight');

      expect(highlight?.options.multicolor).toBe(true);
    });
  });

  // --------------------------------------------------
  // 7. TableKit
  // --------------------------------------------------

  describe('7. TableKit', () => {
    it('7.1. Повинен містити налаштування стилізації таблиці', () => {
      const tableKit = getExtension('tableKit');

      expect(tableKit?.options.table.HTMLAttributes.class).toContain(
        'table-fixed',
      );

      expect(tableKit?.options.table.HTMLAttributes.class).toContain(
        'border-collapse',
      );
    });

    it('7.2. Повинен містити стилі заголовків таблиці', () => {
      const tableKit = getExtension('tableKit');

      expect(tableKit?.options.tableHeader.HTMLAttributes.class).toContain(
        'font-semibold',
      );

      expect(tableKit?.options.tableHeader.HTMLAttributes.class).toContain(
        'bg-muted/60',
      );
    });

    it('7.3. Повинен містити стилі комірок таблиці', () => {
      const tableKit = getExtension('tableKit');

      expect(tableKit?.options.tableCell.HTMLAttributes.class).toContain(
        'border',
      );

      expect(tableKit?.options.tableCell.HTMLAttributes.class).toContain(
        'align-top',
      );
    });
  });
});
