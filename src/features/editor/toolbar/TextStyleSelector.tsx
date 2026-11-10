'use client';

// ua: вибір стилю поточного абзацу
import { useEditorState } from '@tiptap/react';
import type { EditorToolbarSectionProps } from '@/types/editor';

const textStyles = [
  { value: 'normal', label: 'Normal' },
  { value: 'no-spacing', label: 'No Spacing' },
  { value: 'title', label: 'Title' },
  { value: 'subtitle', label: 'Subtitle' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
  { value: 'heading-4', label: 'Heading 4' },
  { value: 'heading-5', label: 'Heading 5' },
  { value: 'heading-6', label: 'Heading 6' },
  { value: 'quote', label: 'Quote' },
] as const;

type TextStyleValue = (typeof textStyles)[number]['value'];

export const TextStyleSelector = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  // ua: визначення активного стилю відповідно до позиції курсора
  const activeStyle = useEditorState({
    editor,
    selector: ({ editor: currentEditor }): TextStyleValue => {
      if (currentEditor.isActive('blockquote')) {
        return 'quote';
      }

      for (let level = 1; level <= 6; level++) {
        if (currentEditor.isActive('heading', { level })) {
          return `heading-${level}` as TextStyleValue;
        }
      }

      const variant = currentEditor.getAttributes('paragraph').paragraphVariant;

      if (
        variant === 'title' ||
        variant === 'subtitle' ||
        variant === 'no-spacing'
      ) {
        return variant;
      }

      return 'normal';
    },
  });

  // ua: вихід із цитати перед застосуванням іншого стилю
  const leaveBlockquote = () => {
    if (editor.isActive('blockquote')) {
      editor.chain().focus().toggleBlockquote().run();
    }
  };

  // ua: застосування стилю до поточного абзацу
  const handleStyleChange = (value: string) => {
    if (disabled || !editor.isEditable) return;

    // ua: цитата є окремим блоковим елементом
    if (value === 'quote') {
      if (!editor.isActive('blockquote')) {
        editor.chain().focus().setBlockquote().run();
      }

      return;
    }

    // ua: якщо курсор знаходиться всередині цитати,
    // спочатку повертаємо абзац у звичайну структуру
    leaveBlockquote();

    // ua: стандартні заголовки
    if (value.startsWith('heading-')) {
      const level = Number(value.replace('heading-', ''));

      if (level >= 1 && level <= 6) {
        editor
          .chain()
          .focus()
          .setHeading({
            level: level as 1 | 2 | 3 | 4 | 5 | 6,
          })
          .run();
      }

      return;
    }

    // ua: звичайний текст і додаткові стилі абзацу
    const paragraphVariant =
      value === 'title' || value === 'subtitle' || value === 'no-spacing'
        ? value
        : null;

    editor.chain().focus().setNode('paragraph', { paragraphVariant }).run();
  };

  return (
    <div className="flex items-center">
      <select
        value={activeStyle}
        disabled={disabled}
        onChange={(event) => handleStyleChange(event.target.value)}
        aria-label="Text style"
        title="Text style"
        className="h-8 min-w-[125px] max-w-[150px] cursor-pointer rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors hover:bg-accent focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {textStyles.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};
