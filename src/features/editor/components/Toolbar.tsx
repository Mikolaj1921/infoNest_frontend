'use client';

// ua: головна панель інструментів редактора
import type { ToolbarProps } from '../../../types/editor';

import { TextFormatting } from '../toolbar/TextFormatting';
import { InsertMenu } from '../toolbar/InsertMenu';
import { HistoryControls } from '../toolbar/HistoryControls';

export const Toolbar = ({ editor }: ToolbarProps) => {
  const disabled = !editor.isEditable;

  return (
    <div className="sticky top-0 z-20 flex w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-card/80 p-2 shadow-sm backdrop-blur-xl select-none">
      {/* ua: інструменти форматування тексту */}
      <TextFormatting editor={editor} disabled={disabled} />

      <div className="h-6 w-px bg-border/60" />

      {/* ua: інструменти вставлення блоків */}
      <InsertMenu editor={editor} disabled={disabled} />

      <div className="h-6 w-px bg-border/60" />

      {/* ua: історія змін */}
      <HistoryControls editor={editor} disabled={disabled} />
    </div>
  );
};
