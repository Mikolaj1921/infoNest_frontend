'use client';

// ua: меню для вставлення додаткових елементів у редактор
import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faQuoteLeft,
  faCode,
  faMinus,
  faImage,
  faTable,
  faArrowDown,
  faArrowRight,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

interface InsertMenuProps extends EditorToolbarSectionProps {
  onInsertImage: (file: File) => Promise<void>;
}

// ua: універсальна кнопка меню вставлення
interface InsertButtonProps {
  title: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const InsertButton = ({
  title,
  disabled = false,
  onClick,
  children,
}: InsertButtonProps) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    disabled={disabled}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className="flex h-8 items-center justify-center gap-2 rounded-lg px-2.5 text-sm text-foreground/80 transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
  >
    {children}
  </button>
);

export const InsertMenu = ({
  editor,
  disabled = false,
  onInsertImage,
}: InsertMenuProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ua: відкриття системного вікна вибору зображення
  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  // ua: обробка вибраного зображення
  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];

    if (file) {
      void onInsertImage(file);
    }

    // ua: дозволяє повторно вибрати той самий файл
    event.currentTarget.value = '';
  };

  const isInsideTable = editor.isActive('table');

  return (
    <div className="flex flex-wrap items-center gap-1">
      {/* ua: приховане поле вибору зображення */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="hidden"
        onChange={handleImageChange}
      />

      {/* ua: блокові елементи */}
      <InsertButton
        title="Insert blockquote"
        disabled={disabled || !editor.can().toggleBlockquote()}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <FontAwesomeIcon icon={faQuoteLeft} />
      </InsertButton>

      <InsertButton
        title="Insert code block"
        disabled={disabled || !editor.can().toggleCodeBlock()}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <FontAwesomeIcon icon={faCode} />
      </InsertButton>

      <InsertButton
        title="Insert horizontal rule"
        disabled={disabled || !editor.can().setHorizontalRule()}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <FontAwesomeIcon icon={faMinus} />
      </InsertButton>

      <div className="mx-1 h-6 w-px bg-border/60" />

      {/* ua: вставлення зображень */}
      <InsertButton
        title="Insert image"
        disabled={disabled}
        onClick={handleImageButtonClick}
      >
        <FontAwesomeIcon icon={faImage} />
        <span>Image</span>
      </InsertButton>

      {/* ua: вставлення таблиці 3x3 із заголовком */}
      <InsertButton
        title="Insert table"
        disabled={disabled || !editor.can().insertTable()}
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({
              rows: 3,
              cols: 3,
              withHeaderRow: true,
            })
            .run()
        }
      >
        <FontAwesomeIcon icon={faTable} />
        <span>Table</span>
      </InsertButton>

      {/* ua: операції з уже створеною таблицею */}
      {isInsideTable && (
        <>
          <div className="mx-1 h-6 w-px bg-border/60" />

          <InsertButton
            title="Add row below"
            disabled={disabled || !editor.can().addRowAfter()}
            onClick={() => editor.chain().focus().addRowAfter().run()}
          >
            <FontAwesomeIcon icon={faArrowDown} />
            <span>Row</span>
          </InsertButton>

          <InsertButton
            title="Add column after"
            disabled={disabled || !editor.can().addColumnAfter()}
            onClick={() => editor.chain().focus().addColumnAfter().run()}
          >
            <FontAwesomeIcon icon={faArrowRight} />
            <span>Column</span>
          </InsertButton>

          <InsertButton
            title="Delete current row"
            disabled={disabled || !editor.can().deleteRow()}
            onClick={() => editor.chain().focus().deleteRow().run()}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Row</span>
          </InsertButton>

          <InsertButton
            title="Delete current column"
            disabled={disabled || !editor.can().deleteColumn()}
            onClick={() => editor.chain().focus().deleteColumn().run()}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Column</span>
          </InsertButton>

          <InsertButton
            title="Delete table"
            disabled={disabled || !editor.can().deleteTable()}
            onClick={() => editor.chain().focus().deleteTable().run()}
          >
            <FontAwesomeIcon icon={faTrash} />
            <span>Table</span>
          </InsertButton>
        </>
      )}
    </div>
  );
};
