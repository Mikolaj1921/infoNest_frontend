'use client';

// ua: компонент панелі інструментів
import { Editor } from '@tiptap/react';
// icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBold,
  faItalic,
  faListUl,
  faHeading,
} from '@fortawesome/free-solid-svg-icons';

// ua: інтерфейс пропсів для Toolbar
interface ToolbarProps {
  editor: Editor;
}

// ua: компонент фіксованої панелі інструментів форматування для едітора
export const Toolbar = ({ editor }: ToolbarProps) => {
  return (
    <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card/40 p-1.5 backdrop-blur-md shadow-sm select-none">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
          editor.isActive('bold')
            ? 'bg-primary/10 text-primary font-bold border border-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="Bold (Ctrl+B)"
      >
        <FontAwesomeIcon icon={faBold} className="h-3.5 w-3.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
          editor.isActive('italic')
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="Italic (Ctrl+I)"
      >
        <FontAwesomeIcon icon={faItalic} className="h-3.5 w-3.5" />
      </button>

      <div className="mx-1 h-4 w-[1px] bg-border/60" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
          editor.isActive('heading', { level: 1 })
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="Heading 1"
      >
        <div className="flex items-center gap-0.5">
          <FontAwesomeIcon icon={faHeading} className="h-3 w-3" />
          <span className="text-[10px]">1</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="Heading 2"
      >
        <div className="flex items-center gap-0.5">
          <FontAwesomeIcon icon={faHeading} className="h-3 w-3" />
          <span className="text-[10px]">2</span>
        </div>
      </button>

      <div className="mx-1 h-4 w-[1px] bg-border/60" />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 cursor-pointer ${
          editor.isActive('bulletList')
            ? 'bg-primary/10 text-primary border border-primary/20'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }`}
        title="Bullet List"
      >
        <FontAwesomeIcon icon={faListUl} className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
