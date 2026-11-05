'use client';

// ua: керування історією змін редактора
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotateLeft, faRotateRight } from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

export const HistoryControls = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  const buttonClass =
    'flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30';

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !canUndo}
        className={buttonClass}
        title="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <FontAwesomeIcon icon={faRotateLeft} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !canRedo}
        className={buttonClass}
        title="Redo (Ctrl+Shift+Z)"
        aria-label="Redo"
      >
        <FontAwesomeIcon icon={faRotateRight} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
