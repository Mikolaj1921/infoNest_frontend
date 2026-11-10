import { Extension } from '@tiptap/core';

// ua: допустимі додаткові стилі абзаців
const paragraphVariants = ['title', 'subtitle', 'no-spacing'] as const;

// ua: додаткові стилі абзаців редактора
export const ParagraphStyle = Extension.create({
  name: 'paragraphStyle',

  // ua: додаємо атрибут стилю до звичайного абзацу
  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          paragraphVariant: {
            default: null,

            // ua: відновлення стилю з HTML
            parseHTML: (element) => {
              const value = element.getAttribute('data-editor-style');

              return paragraphVariants.includes(
                value as (typeof paragraphVariants)[number],
              )
                ? value
                : null;
            },

            // ua: збереження стилю в HTML
            renderHTML: (attributes) => {
              const value = attributes.paragraphVariant;

              if (
                !paragraphVariants.includes(
                  value as (typeof paragraphVariants)[number],
                )
              ) {
                return {};
              }

              return {
                'data-editor-style': value,
              };
            },
          },
        },
      },
    ];
  },
});
