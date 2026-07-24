import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { WorkspaceDocument, WorkspaceCategory } from '@/types/document';

// modal
import { useModal } from '@/hooks/use-modal-store';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFileLines,
  faFolderOpen,
  faChevronDown,
  faEllipsisVertical,
} from '@fortawesome/free-solid-svg-icons';

// ua: компонент для відображення 1 doc
interface DocItemProps {
  doc: WorkspaceDocument;
}

const DocItem = ({ doc }: DocItemProps) => {
  // docId from url params to determine active document
  const params = useParams();

  // ua: workspaceId витягується з url
  const workspaceId = typeof params?.id === 'string' ? params.id : 'global';
  // ua: визначення активного документа
  const activeDocId = typeof params?.docId === 'string' ? params.docId : '';

  // ua: перевірка, чи поточний документ є активним
  const isActive = activeDocId === doc.id;

  return (
    <div className="ml-4 border-l border-border/40 pl-2 space-y-1">
      <Link
        href={`/workspace/${workspaceId}/documents/${doc.id}`}
        className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all duration-200 cursor-pointer text-left group ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }`}
      >
        <FontAwesomeIcon
          icon={faFileLines}
          className={`h-3.5 w-3.5 transition-colors ${
            isActive
              ? 'text-primary'
              : 'text-muted-foreground/60 group-hover:text-primary/80'
          }`}
        />
        <span className="truncate">{doc.title}</span>
      </Link>
    </div>
  );
};

// ----

// ua: компонент для відображення папки (категорії)
interface FolderItemProps {
  category: WorkspaceCategory;
  isExpanded?: boolean; // ua: проп для початкового стану відкриття папки
  onToggle?: () => void; // ua: колбек для повідомлення батьківського компонента про зміну стану
}

const FolderItem = ({ category, isExpanded, onToggle }: FolderItemProps) => {
  // ua: локальний стан для керування відкриттям/закриттям актуальної папки
  //const [isExpanded, setIsExpanded] = useState(false);

  // modal
  const { onOpen } = useModal();

  return (
    <div className="space-y-1 w-full group/folder">
      <div className="flex w-full items-center justify-between rounded-md pr-2 hover:bg-accent/50 transition-all duration-200 group">
        {/* ua: кнопка папки */}
        <button
          onClick={onToggle}
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

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); // ua: зупинка спливання події, щоб не викликати toggleFolder при кліку на кнопку
            onOpen('deleteCategory', {
              categoryId: category.id,
              categoryName: category.name,
            });
          }}
          className="opacity-0 group-hover/folder:opacity-100 h-6 w-6 rounded-md text-muted-foreground/40 hover:text-foreground hover:bg-background/80 flex items-center justify-center transition-all cursor-pointer focus:opacity-100 focus:outline-none"
          title="Керування папкою"
        >
          <FontAwesomeIcon icon={faEllipsisVertical} className="h-3 w-3" />
        </button>
      </div>

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
  const params = useParams();
  // ua: динамічний айдішник воркспейсу аби прив'язати ключ localStorage до конкретного воркспейсу
  const workspaceId = typeof params?.id === 'string' ? params.id : 'global';
  // ua: визначення активного документа для логіки автоматичного розгортання папки
  const activeDocId = typeof params?.docId === 'string' ? params.docId : '';

  const storageKey = `infonest-expanded-folders-${workspaceId}`;

  // ua: стейт відразу на старті ініціалізується даними з локалстору, або порожнім масивом (дані папок)
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>(() => {
    let initialIds: string[] = [];

    // ua: зчитування раніше збережених папок з локалстору
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          initialIds = JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse expanded folders data', e);
        }
      }
    }

    // ua: скан структури: якщо є активний документ, додаємо його батьківську папку
    if (activeDocId && categories.length > 0) {
      const parentCategory = categories.find((category) =>
        category.documents.some((doc) => doc.id === activeDocId),
      );

      if (parentCategory && !initialIds.includes(parentCategory.id)) {
        initialIds.push(parentCategory.id);
      }
    }

    return initialIds;
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
          isExpanded={expandedFolderIds.includes(category.id)} // ua: перевіряємо, чи папка має бути відкритою
          onToggle={() => toggleFolder(category.id)}
        />
      ))}
    </div>
  );
};
