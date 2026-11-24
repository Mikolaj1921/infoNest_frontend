// ai tests - paragraphStyle extension

import { describe, it, expect } from 'vitest';

import { ParagraphStyle } from './ParagraphStyle';

// ua: отримання конфігурації глобальних атрибутів абзацу
const globalAttributes = ParagraphStyle.config.addGlobalAttributes?.call(
  ParagraphStyle as never,
);

// ua: безпечне отримання атрибута paragraphVariant
const paragraphVariant = globalAttributes?.[0]?.attributes.paragraphVariant;

// ua: отримання функції відновлення стилю з HTML
const parseHTML = paragraphVariant?.parseHTML as
  | ((element: HTMLElement) => string | null)
  | undefined;

// ua: отримання функції збереження стилю в HTML
const renderHTML = paragraphVariant?.renderHTML as
  | ((attributes: {
      paragraphVariant: string | null;
    }) => Record<string, string>)
  | undefined;

// ua: створення HTML-елемента для перевірки відновлення стилю
const createElement = (value?: string) => {
  const element = document.createElement('p');

  if (value !== undefined) {
    element.setAttribute('data-editor-style', value);
  }

  return element;
};

describe('ParagraphStyle', () => {
  // --------------------------------------------------
  // 1. Extension configuration
  // --------------------------------------------------

  describe('1. Extension configuration', () => {
    it('1.1. Повинен мати назву paragraphStyle', () => {
      expect(ParagraphStyle.name).toBe('paragraphStyle');
    });

    it('1.2. Повинен реєструвати глобальні атрибути абзацу', () => {
      expect(globalAttributes).toHaveLength(1);
      expect(globalAttributes?.[0].types).toEqual(['paragraph']);
    });

    it('1.3. Повинен мати paragraphVariant зі значенням null за замовчуванням', () => {
      expect(paragraphVariant?.default).toBe(null);
    });

    it('1.4. Повинен визначати функцію відновлення стилю з HTML', () => {
      expect(parseHTML).toBeTypeOf('function');
    });

    it('1.5. Повинен визначати функцію збереження стилю в HTML', () => {
      expect(renderHTML).toBeTypeOf('function');
    });
  });

  // --------------------------------------------------
  // 2. HTML parsing
  // --------------------------------------------------

  describe('2. HTML parsing', () => {
    it('2.1. Повинен відновлювати стиль title з HTML', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement('title'))).toBe('title');
    });

    it('2.2. Повинен відновлювати стиль subtitle з HTML', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement('subtitle'))).toBe('subtitle');
    });

    it('2.3. Повинен відновлювати стиль no-spacing з HTML', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement('no-spacing'))).toBe('no-spacing');
    });

    it('2.4. Повинен повертати null, якщо атрибут стилю відсутній', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement())).toBe(null);
    });

    it('2.5. Повинен повертати null для невідомого стилю', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement('unknown'))).toBe(null);
    });

    it('2.6. Повинен повертати null для порожнього значення атрибута', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement(''))).toBe(null);
    });

    it('2.7. Повинен повертати null для некоректного регістру', () => {
      if (!parseHTML) {
        throw new Error('paragraphVariant.parseHTML is not defined');
      }

      expect(parseHTML(createElement('TITLE'))).toBe(null);
    });
  });

  // --------------------------------------------------
  // 3. HTML rendering
  // --------------------------------------------------

  describe('3. HTML rendering', () => {
    it('3.1. Повинен зберігати стиль title в HTML', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: 'title' })).toEqual({
        'data-editor-style': 'title',
      });
    });

    it('3.2. Повинен зберігати стиль subtitle в HTML', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: 'subtitle' })).toEqual({
        'data-editor-style': 'subtitle',
      });
    });

    it('3.3. Повинен зберігати стиль no-spacing в HTML', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: 'no-spacing' })).toEqual({
        'data-editor-style': 'no-spacing',
      });
    });

    it('3.4. Повинен повертати порожній об’єкт для null', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: null })).toEqual({});
    });

    it('3.5. Повинен повертати порожній об’єкт для невідомого стилю', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: 'unknown' })).toEqual({});
    });

    it('3.6. Повинен повертати порожній об’єкт для порожнього рядка', () => {
      if (!renderHTML) {
        throw new Error('paragraphVariant.renderHTML is not defined');
      }

      expect(renderHTML({ paragraphVariant: '' })).toEqual({});
    });
  });
});
