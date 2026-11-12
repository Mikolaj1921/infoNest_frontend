'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { WorkspaceDocument, WorkspaceCategory } from '@/types/document';

// modal
import { useModal } from '@/hooks/use-modal-store';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolder,
  faFileLines,
  faFolderOpen,
  faChevronDown,
  faPlus,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

// ua: компонент для відображення 1 doc
interface DocItemProps {
  doc: WorkspaceDocument;
}

const DocItem = ({ doc }: DocItemProps) => {
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
        href={`/workspaces/${workspaceId}/documents/${doc.id}`}
        className={`group flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm ${
          isActive
            ? 'bg-primary/10 font-semibold text-primary'
            : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        }`}
      >
        <FontAwesomeIcon
          icon={faFileLines}
          className={`h-3.5 w-3.5 ${
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

// ua: компонент для відображення папки (категорії)
interface FolderItemProps {
  category: WorkspaceCategory;
  isExpanded?: boolean;
  onToggle?: () => void;
}

const FolderItem = ({ category, isExpanded, onToggle }: FolderItemProps) => {
  const { onOpen } = useModal();

  return (
    <div className="w-full space-y-1">
      {/* ua: додано group/folder для коректної появи кнопок дій при наведенні */}

      <div className="group/folder relative flex w-full items-center rounded-md hover:bg-accent">
        {/* ua: кнопка папки */}
        <button
          type="button"
          onClick={onToggle}
          className="group/folder-button flex min-w-0 w-full cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 pr-20 text-left text-sm text-muted-foreground hover:text-foreground"
        >
          <FontAwesomeIcon
            icon={isExpanded ? faFolderOpen : faFolder}
            className={`h-3.5 w-3.5 shrink-0 ${
              isExpanded ? 'text-primary' : 'text-primary/70'
            }`}
          />

          <span className="truncate font-medium ">{category.name}</span>

          {/* ua: стрілка що обертається при змінах стану */}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`ml-auto mr-2 h-2.5 w-2.5 shrink-0 text-muted-foreground/40 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-foreground' : ''
            }`}
          />
        </button>
        {/* ua: блок дій папки при наведенні */}
        <div className="pointer-events-none absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-0.5 opacity-0 group-hover/folder:pointer-events-auto group-hover/folder:opacity-100 group-focus-within/folder:pointer-events-auto group-focus-within/folder:opacity-100">
          {/* ua: створення документа всередині папки */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              onOpen('createDocument', {
                categoryId: category.id,
                categoryName: category.name,
              });
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Create document"
            aria-label={`Create document in ${category.name}`}
          >
            <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
          </button>

          {/* ua: перейменування категорії */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              onOpen('editCategory', {
                categoryId: category.id,
                categoryName: category.name,
              });
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Rename folder"
            aria-label={`Rename ${category.name}`}
          >
            <FontAwesomeIcon icon={faPen} className="h-3 w-3" />
          </button>

          {/* ua: видалення категорії */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();

              onOpen('deleteCategory', {
                categoryId: category.id,
                categoryName: category.name,
              });
            }}
            className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-muted-foreground/60 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            title="Delete folder"
            aria-label={`Delete ${category.name}`}
          >
            <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* ua: рендеринг вкладених документів при відкритій папці */}
      {isExpanded && (
        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
          {category.documents.length === 0 ? (
            <div className="ml-4 border-l border-border/40 py-1 pl-5 text-left text-[11px] italic text-muted-foreground/40">
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

// ua: основний компонент для відображення дерева
interface NavTreeProps {
  categories: WorkspaceCategory[];
}

export const NavTree = ({ categories }: NavTreeProps) => {
  const params = useParams();

  // ua: динамічний айдішник воркспейсу
  const workspaceId = typeof params?.id === 'string' ? params.id : 'global';

  // ua: визначення активного документа
  const activeDocId = typeof params?.docId === 'string' ? params.docId : '';

  const storageKey = `infonest-expanded-folders-${workspaceId}`;

  // ua: початковий стан відкритих папок
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>(() => {
    let initialIds: string[] = [];

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        try {
          initialIds = JSON.parse(saved);
        } catch (error) {
          console.error('Failed to parse expanded folders data', error);
        }
      }
    }

    // ua: автоматично відкриваємо папку активного документа
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

  // ua: збереження відкритих папок у localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(expandedFolderIds));
  }, [expandedFolderIds, storageKey]);

  // ua: перемикання стану окремої папки
  const toggleFolder = (folderId: string) => {
    setExpandedFolderIds((previous) => {
      const nextIds = previous.includes(folderId)
        ? previous.filter((id) => id !== folderId)
        : [...previous, folderId];

      localStorage.setItem(storageKey, JSON.stringify(nextIds));

      return nextIds;
    });
  };

  return (
    <div className="w-full space-y-1 px-1">
      {categories.map((category) => (
        <FolderItem
          key={category.id}
          category={category}
          isExpanded={expandedFolderIds.includes(category.id)}
          onToggle={() => toggleFolder(category.id)}
        />
      ))}
    </div>
  );
};
