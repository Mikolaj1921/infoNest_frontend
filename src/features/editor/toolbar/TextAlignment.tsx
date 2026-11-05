'use client';

// ua: інструменти вирівнювання тексту
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignLeft,
  faAlignCenter,
  faAlignRight,
  faAlignJustify,
} from '@fortawesome/free-solid-svg-icons';

import type { EditorToolbarSectionProps } from '@/types/editor';

const alignments = [
  { value: 'left', icon: faAlignLeft, label: 'Align left' },
  { value: 'center', icon: faAlignCenter, label: 'Align center' },
  { value: 'right', icon: faAlignRight, label: 'Align right' },
  { value: 'justify', icon: faAlignJustify, label: 'Justify' },
] as const;

export const TextAlignment = ({
  editor,
  disabled = false,
}: EditorToolbarSectionProps) => {
  const getButtonClass = (isActive: boolean) =>
    `flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      isActive
        ? 'bg-primary/10 text-primary border-primary/20'
        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-foreground'
    }`;

  return (
    <div className="flex items-center gap-1">
      {alignments.map(({ value, icon, label }) => {
        const isActive = editor.isActive({ textAlign: value });

        return (
          <button
            key={value}
            type="button"
            onClick={() => editor.chain().focus().setTextAlign(value).run()}
            disabled={disabled}
            className={getButtonClass(isActive)}
            title={label}
            aria-label={label}
            aria-pressed={isActive}
          >
            <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
};
