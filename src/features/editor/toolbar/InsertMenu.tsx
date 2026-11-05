'use client';

// ua: інструменти вставлення блоків у документ
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuoteLeft,
  faCode,
  faMinus,
} from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

export const InsertMenu = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  // ua: спільні стилі кнопок вставлення
  const getButtonClass = (isActive = false) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
    }`;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        disabled={disabled || !editor.can().toggleBlockquote()}
        className={getButtonClass(editor.isActive('blockquote'))}
        title="Blockquote"
        aria-label="Insert blockquote"
        aria-pressed={editor.isActive('blockquote')}
      >
        <FontAwesomeIcon icon={faQuoteLeft} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={disabled || !editor.can().toggleCodeBlock()}
        className={getButtonClass(editor.isActive('codeBlock'))}
        title="Code block"
        aria-label="Insert code block"
        aria-pressed={editor.isActive('codeBlock')}
      >
        <FontAwesomeIcon icon={faCode} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={disabled || !editor.can().setHorizontalRule()}
        className={getButtonClass()}
        title="Horizontal divider"
        aria-label="Insert horizontal divider"
      >
        <FontAwesomeIcon icon={faMinus} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
