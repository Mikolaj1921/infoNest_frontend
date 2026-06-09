import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { WorkspaceDocument, WorkspaceCategory } from '@/types/document';
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
  isExpended?: boolean; // ua: проп для початкового стану відкриття папки
  onToggle?: () => void; // ua: колбек для повідомлення батьківського компонента про зміну стану
}

const FolderItem = ({ category, isExpended, onToggle }: FolderItemProps) => {
  // ua: локальний стан для керування відкриттям/закриттям актуальної папки
  //const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-1 w-full">
      {/* ua: кнопка папки */}
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left group"
      >
        <FontAwesomeIcon
          icon={isExpended ? faFolderOpen : faFolder}
          className={`h-3.5 w-3.5 transition-colors ${isExpended ? 'text-primary' : 'text-primary/70'}`}
        />
        <span className="truncate font-medium">{category.name}</span>

        {/* ua: стрілка що плавно обертається при змінах стану */}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`ml-auto h-2.5 w-2.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-transform duration-200 ${
            isExpended ? 'rotate-180 text-foreground' : ''
          }`}
        />
      </button>

      {/* ua: рендеринг вкладених документів при відкритій папці */}
      {isExpended && (
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
  const params = useParams();
  // ua: динамічний айдішник воркспейсу аби прив'язати ключ localStorage до конкретного воркспейсу
  const workspaceId = typeof params?.id === 'string' ? params.id : 'global';
  const storageKey = `infonest-expanded-folders-${workspaceId}`;

  // ua: стейт відразу на старті ініціалізується даними з локалстору, або порожнім масивом (дані папок)
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse expanded folders data', e);
        }
      }
    }
    return [];
  });

  // ua: ефект для збереження змін у локалстор при оновленні стану expandedFolderIds (видалення/додавання папки стану)
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(expandedFolderIds));
  }, [expandedFolderIds, storageKey]);

  // ua: функція перемикання стану окремої папки
  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((prev) => {
      const nextIds = prev.includes(folderId)
        ? prev.filter((id) => id !== folderId) // ua: якщо вже є то видалити з масив (згортаєься)
        : [...prev, folderId]; // ua: якщо нема то додається в масив (розгортається)

      // ua: записуємо оновлений масив у локалстор
      localStorage.setItem(storageKey, JSON.stringify(nextIds));
      return nextIds;
    });
  };

  return (
    <div className="space-y-1 w-full px-1">
      {categories.map((category) => (
        <FolderItem
          key={category.id}
          category={category}
          isExpended={expandedFolderIds.includes(category.id)} // ua: перевіряємо, чи папка має бути відкритою
          onToggle={() => toggleFolder(category.id)}
        />
      ))}
    </div>
  );
};
