'use client';

// ua: вибір стилю поточного абзацу
import { useEditorState } from '@tiptap/react';
import type { EditorToolbarSectionProps } from '@/types/editor';

const textStyles = [
  { value: 'normal', label: 'Normal' },
  { value: 'heading-1', label: 'Heading 1' },
  { value: 'heading-2', label: 'Heading 2' },
  { value: 'heading-3', label: 'Heading 3' },
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
      for (let level = 1; level <= 3; level++) {
        if (currentEditor.isActive('heading', { level })) {
          return `heading-${level}` as TextStyleValue;
        }
      }

      return 'normal';
    },
  });

  // ua: застосування стилю до поточного абзацу
  const handleStyleChange = (value: TextStyleValue) => {
    if (disabled || !editor.isEditable) return;

    if (value.startsWith('heading-')) {
      const level = Number(value.replace('heading-', ''));

      if (level >= 1 && level <= 3) {
        editor
          .chain()
          .focus()
          .setHeading({
            level: level as 1 | 2 | 3,
          })
          .run();
      }

      return;
    }

    editor.chain().focus().setParagraph().run();
  };

  return (
    <div className="flex items-center">
      <select
        value={activeStyle}
        disabled={disabled}
        onChange={(event) =>
          handleStyleChange(event.target.value as TextStyleValue)
        }
        aria-label="Text style"
        title="Text style"
        className="h-8 min-w-[125px] max-w-[150px] cursor-pointer rounded-lg border border-border/70 bg-background px-2 text-xs font-medium text-foreground outline-none hover:bg-card focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40"
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
