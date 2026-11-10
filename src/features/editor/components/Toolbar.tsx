'use client';

// ua: головна панель інструментів редактора
import type { ToolbarProps } from '../../../types/editor';

import { TextStyleSelector } from '../toolbar/TextStyleSelector';
import { TextFormatting } from '../toolbar/TextFormatting';
import { TextAlignment } from '../toolbar/TextAlignment';
import { InsertMenu } from '../toolbar/InsertMenu';
import { HistoryControls } from '../toolbar/HistoryControls';

export const Toolbar = ({ editor, onInsertImage }: ToolbarProps) => {
  const disabled = !editor.isEditable;

  return (
    <div className="sticky top-0 z-20 flex w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card/95 p-2 shadow-sm select-none">
      {/* ua: вибір стилю тексту */}
      <TextStyleSelector editor={editor} disabled={disabled} />

      <div className="h-6 w-px bg-border/60" />

      {/* ua: історія змін */}
      <HistoryControls editor={editor} disabled={disabled} />

      <div className="h-6 w-p-px bg-border/60" />

      {/* ua: інструменти форматування */}
      <TextFormatting editor={editor} disabled={disabled} />

      <div className="h-6 w-px bg-border/60" />

      {/* ua: вирівнювання тексту */}
      <TextAlignment editor={editor} disabled={disabled} />

      <div className="h-6 w-px bg-border/60" />

      {/* ua: вставлення блоків, зображень і таблиць */}
      <InsertMenu
        editor={editor}
        disabled={disabled}
        onInsertImage={onInsertImage}
      />
    </div>
  );
};
