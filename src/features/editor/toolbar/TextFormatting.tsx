'use client';

// ua: інструменти форматування тексту
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
} from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

export const TextFormatting = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  // ua: спільні стилі кнопок форматування
  const getButtonClass = (isActive: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
    }`;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled || !editor.can().toggleBold()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
        aria-pressed={editor.isActive('bold')}
      >
        <FontAwesomeIcon icon={faBold} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled || !editor.can().toggleItalic()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
        aria-pressed={editor.isActive('italic')}
      >
        <FontAwesomeIcon icon={faItalic} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled || !editor.can().toggleUnderline()}
        className={getButtonClass(editor.isActive('underline'))}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
        aria-pressed={editor.isActive('underline')}
      >
        <FontAwesomeIcon icon={faUnderline} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled || !editor.can().toggleStrike()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
        aria-label="Strikethrough"
        aria-pressed={editor.isActive('strike')}
      >
        <FontAwesomeIcon icon={faStrikethrough} className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-5 w-px bg-border/60" />

      {[1, 2, 3].map((level) => (
        <button
          key={level}
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: level as 1 | 2 | 3 })
              .run()
          }
          disabled={
            disabled ||
            !editor.can().toggleHeading({ level: level as 1 | 2 | 3 })
          }
          className={`${getButtonClass(
            editor.isActive('heading', { level }),
          )} text-[11px] font-bold`}
          title={`Heading ${level}`}
          aria-label={`Heading ${level}`}
          aria-pressed={editor.isActive('heading', { level })}
        >
          <span>H{level}</span>
        </button>
      ))}

      <div className="mx-1 h-5 w-px bg-border/60" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled || !editor.can().toggleBulletList()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet list"
        aria-label="Bullet list"
        aria-pressed={editor.isActive('bulletList')}
      >
        <FontAwesomeIcon icon={faListUl} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled || !editor.can().toggleOrderedList()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Numbered list"
        aria-label="Numbered list"
        aria-pressed={editor.isActive('orderedList')}
      >
        <FontAwesomeIcon icon={faListOl} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
