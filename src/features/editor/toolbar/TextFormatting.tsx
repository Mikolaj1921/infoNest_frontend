'use client';

// ua: інструменти форматування тексту
import { useEditorState } from '@tiptap/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faUnderline,
  faStrikethrough,
  faListUl,
  faListOl,
  faHighlighter,
  faPalette,
  faEraser,
} from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

const textColors = [
  '#000000',
  '#6B7280',
  '#DC2626',
  '#EA580C',
  '#CA8A04',
  '#16A34A',
  '#2563EB',
  '#9333EA',
] as const;

const highlightColors = [
  '#FEF08A',
  '#BBF7D0',
  '#BFDBFE',
  '#E9D5FF',
  '#FBCFE8',
  '#FED7AA',
] as const;

export const TextFormatting = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  // ua: відстежуємо активний стан форматування редактора
  const activeStates = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => ({
      bold: currentEditor.isActive('bold'),
      italic: currentEditor.isActive('italic'),
      underline: currentEditor.isActive('underline'),
      strike: currentEditor.isActive('strike'),
      textColor: Boolean(currentEditor.getAttributes('textStyle').color),
      highlight: currentEditor.isActive('highlight'),
      bulletList: currentEditor.isActive('bulletList'),
      orderedList: currentEditor.isActive('orderedList'),
    }),
  });

  const getButtonClass = (isActive: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-primary/20 text-primary border-primary/40 shadow-sm'
        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={disabled || !editor.can().toggleBold()}
        className={getButtonClass(activeStates.bold)}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
        aria-pressed={activeStates.bold}
      >
        <FontAwesomeIcon icon={faBold} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={disabled || !editor.can().toggleItalic()}
        className={getButtonClass(activeStates.italic)}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
        aria-pressed={activeStates.italic}
      >
        <FontAwesomeIcon icon={faItalic} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={disabled || !editor.can().toggleUnderline()}
        className={getButtonClass(activeStates.underline)}
        title="Underline (Ctrl+U)"
        aria-label="Underline"
        aria-pressed={activeStates.underline}
      >
        <FontAwesomeIcon icon={faUnderline} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={disabled || !editor.can().toggleStrike()}
        className={getButtonClass(activeStates.strike)}
        title="Strikethrough"
        aria-label="Strikethrough"
        aria-pressed={activeStates.strike}
      >
        <FontAwesomeIcon icon={faStrikethrough} className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-5 w-px bg-border/60" />

      {/* ua: вибір кольору тексту */}
      <div className="group relative">
        <button
          type="button"
          disabled={disabled}
          className={getButtonClass(activeStates.textColor)}
          title="Text color"
          aria-label="Text color"
          aria-pressed={activeStates.textColor}
        >
          <FontAwesomeIcon icon={faPalette} className="h-3.5 w-3.5" />
        </button>

        <div className="invisible absolute left-0 top-full z-50 mt-2 w-40 rounded-xl border border-border bg-card p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Text color
          </p>

          <div className="grid grid-cols-4 gap-2">
            {textColors.map((color) => (
              <button
                key={color}
                type="button"
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => editor.chain().focus().setColor(color).run()}
                className="h-6 w-6 rounded-full border border-border/70 transition-transform hover:scale-110 disabled:opacity-40"
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Set text color ${color}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FontAwesomeIcon icon={faEraser} />
            Remove color
          </button>
        </div>
      </div>

      {/* ua: підсвічування тексту */}
      <div className="group relative">
        <button
          type="button"
          disabled={disabled}
          className={getButtonClass(activeStates.highlight)}
          title="Highlight text"
          aria-label="Highlight text"
          aria-pressed={activeStates.highlight}
        >
          <FontAwesomeIcon icon={faHighlighter} className="h-3.5 w-3.5" />
        </button>

        <div className="invisible absolute left-0 top-full z-50 mt-2 w-40 rounded-xl border border-border bg-card p-3 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">
            Highlight color
          </p>

          <div className="grid grid-cols-3 gap-2">
            {highlightColors.map((color) => (
              <button
                key={color}
                type="button"
                disabled={disabled}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() =>
                  editor.chain().focus().setHighlight({ color }).run()
                }
                className="h-7 rounded-lg border border-border/70 transition-transform hover:scale-105 disabled:opacity-40"
                style={{ backgroundColor: color }}
                title={color}
                aria-label={`Highlight with ${color}`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={disabled}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FontAwesomeIcon icon={faEraser} />
            Remove highlight
          </button>
        </div>
      </div>

      <div className="mx-1 h-5 w-px bg-border/60" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        disabled={disabled || !editor.can().toggleBulletList()}
        className={getButtonClass(activeStates.bulletList)}
        title="Bullet list"
        aria-label="Bullet list"
        aria-pressed={activeStates.bulletList}
      >
        <FontAwesomeIcon icon={faListUl} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={disabled || !editor.can().toggleOrderedList()}
        className={getButtonClass(activeStates.orderedList)}
        title="Numbered list"
        aria-label="Numbered list"
        aria-pressed={activeStates.orderedList}
      >
        <FontAwesomeIcon icon={faListOl} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
