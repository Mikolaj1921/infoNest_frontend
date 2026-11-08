'use client';

// ua: контекстне меню форматування виділеного тексту (Bubble Menu)
import { BubbleMenu } from '@tiptap/react/menus';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faLink,
  faHeading,
  faEraser,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { Editor } from '@tiptap/react';

interface EditorBubbleMenuProps {
  editor: Editor;
}

interface ActionButtonProps {
  title: string;
  icon: IconDefinition;
  active?: boolean;
  onClick: () => void;
}

// ua: універс кнопка контекстного меню
const ActionButton = ({
  title,
  icon,
  active = false,
  onClick,
}: ActionButtonProps) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm transition-colors ${
      active
        ? 'bg-primary/15 text-primary'
        : 'text-foreground/80 hover:bg-muted hover:text-foreground'
    }`}
  >
    <FontAwesomeIcon icon={icon} />
  </button>
);

// ua: палітра кольорів тексту
const TEXT_COLORS = [
  '#000000',
  '#DC2626',
  '#EA580C',
  '#16A34A',
  '#2563EB',
  '#9333EA',
];

// ua: палітра кольорів виділення
const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8'];

export const EditorBubbleMenu = ({ editor }: EditorBubbleMenuProps) => {
  if (!editor) return null;

  // ua: перевірка, чи потрібно показувати контекстне меню
  const shouldShow = () => {
    const { selection } = editor.state;

    return (
      editor.isEditable &&
      !selection.empty &&
      selection.$from.parent.isTextblock
    );
  };

  // ua: встановлення посилання для виділеного тексту
  const handleSetLink = () => {
    const previousUrl = editor.getAttributes('link').href || '';

    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) return;

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  };

  return (
    <BubbleMenu editor={editor} shouldShow={shouldShow}>
      <div className="flex max-w-[95vw] flex-wrap items-center gap-1 rounded-xl border border-border bg-card/95 p-2 shadow-xl backdrop-blur-xl">
        {/* ua: базове форматування */}
        <ActionButton
          title="Bold"
          icon={faBold}
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />

        <ActionButton
          title="Italic"
          icon={faItalic}
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />

        <ActionButton
          title="Underline"
          icon={faUnderline}
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <ActionButton
          title="Strikethrough"
          icon={faStrikethrough}
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />

        <div className="mx-1 h-6 w-px bg-border" />

        {/* ua: заголовки */}
        {[1, 2, 3].map((level) => (
          <button
            key={level}
            type="button"
            title={`Heading ${level}`}
            aria-label={`Heading ${level}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 })
                .run()
            }
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-colors ${
              editor.isActive('heading', { level })
                ? 'bg-primary/15 text-primary'
                : 'text-foreground/80 hover:bg-muted'
            }`}
          >
            H{level}
          </button>
        ))}

        <div className="mx-1 h-6 w-px bg-border" />

        {/* ua: посилання */}
        <ActionButton
          title="Add or edit link"
          icon={faLink}
          active={editor.isActive('link')}
          onClick={handleSetLink}
        />

        <div className="mx-1 h-6 w-px bg-border" />

        {/* ua: кольори тексту */}
        <div className="flex items-center gap-1 px-1">
          <FontAwesomeIcon
            icon={faHeading}
            className="mr-1 text-xs text-muted-foreground"
          />

          {TEXT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Text color ${color}`}
              aria-label={`Text color ${color}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => editor.chain().focus().setColor(color).run()}
              className="h-4 w-4 rounded-full border border-border/70 transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            />
          ))}

          <button
            type="button"
            title="Clear text color"
            aria-label="Clear text color"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-xs text-muted-foreground hover:bg-muted"
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
        </div>

        <div className="mx-1 h-6 w-px bg-border" />

        {/* ua: кольори виділення */}
        <div className="flex items-center gap-1 px-1">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              title={`Highlight ${color}`}
              aria-label={`Highlight ${color}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() =>
                editor.chain().focus().setHighlight({ color }).run()
              }
              className="h-4 w-4 rounded-full border border-border/70 transition-transform hover:scale-125"
              style={{ backgroundColor: color }}
            />
          ))}

          <button
            type="button"
            title="Remove highlight"
            aria-label="Remove highlight"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-xs text-muted-foreground hover:bg-muted"
          >
            <FontAwesomeIcon icon={faEraser} />
          </button>
        </div>
      </div>
    </BubbleMenu>
  );
};
