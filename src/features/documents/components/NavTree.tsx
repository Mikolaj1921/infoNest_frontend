import { useState } from 'react';
import { WorkspaceCategory } from '@/types/document';
import { WorkspaceDocument } from '@/types/document';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFileLines,
  faFolderOpen,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';

// ua: компонент для відображення 1 doc
interface DocItemProps {
  doc: WorkspaceDocument;
}

const DocItem = ({ doc }: DocItemProps) => {
  return (
    <div className="ml-4 border-l border-border/40 pl-2 space-y-1">
      <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left group">
        <FontAwesomeIcon
          icon={faFileLines}
          className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary/80 transition-colors"
        />
        <span className="truncate">{doc.title}</span>
      </button>
    </div>
  );
};

// ----

// ua: компонент для відображення папки (категорії)
interface FolderItemProps {
  category: WorkspaceCategory;
}

const FolderItem = ({ category }: FolderItemProps) => {
  // ua: локальний стан для керування відкриттям/закриттям актуальної папки
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-1 w-full">
      {/* ua: кнопка папки */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left group"
      >
        <FontAwesomeIcon
          icon={isExpanded ? faFolderOpen : faFolder}
          className={`h-3.5 w-3.5 transition-colors ${isExpanded ? 'text-primary' : 'text-primary/70'}`}
        />
        <span className="truncate font-medium">{category.name}</span>

        {/* ua: стрілка що плавно обертається при змінах стану */}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`ml-auto h-2.5 w-2.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180 text-foreground' : ''
          }`}
        />
      </button>

      {/* ua: рендеринг вкладених документів при відкритій папці */}
      {isExpanded && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {category.documents.length === 0 ? (
            <div className="ml-4 border-l border-border/40 pl-5 py-1 text-[11px] text-muted-foreground/40 italic text-left">
              Empty folder
            </div>
          ) : (
            category.documents.map((doc) => <DocItem key={doc.id} doc={doc} />)
          )}
        </div>
      )}
    </div>
  );
};

// ---

// ua: основний компонент для відображення дерева

interface NavTreeProps {
  categories: WorkspaceCategory[];
}

export const NavTree = ({ categories }: NavTreeProps) => {
  return (
    <div className="space-y-1 w-full px-1">
      {categories.map((category) => (
        <FolderItem key={category.id} category={category} />
      ))}
    </div>
  );
};
