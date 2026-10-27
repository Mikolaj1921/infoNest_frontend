// workscape main page - docs, kanban & whiteboard

'use client';

import { useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen,
  faTasks,
  faPlus,
  faChalkboard,
  faFileLines,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';
// dnd libs
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { move } from '@dnd-kit/helpers';
// tanstack
import { useQueryClient } from '@tanstack/react-query';
// kanban hooks
import {
  useWorkspaceKanban,
  useCreateColumn,
  useReorderTasks,
} from '@/hooks/useKanbanData';
import { useWorkspaceStructure } from '@/features/documents/hooks/useWorkspaceStructure';
// modals
import { BoardColumn } from '@/features/kanban/components/BoardColumn';
// whiteboard
import WhiteboardWrapper from '@/features/whiteboard/components/WhiteboardWrapper';
//import type { WhiteboardElements } from '@/features/whiteboard/components/WhiteboardCanvas';
// usemodal
import { useModal } from '@/hooks/use-modal-store';
// kanban
import { BoardTask, TaskCategory } from '@/types/kanban';

type TaskGroups = Record<string, BoardTask[]>;

function cloneGroups(groups: TaskGroups): TaskGroups {
  return Object.fromEntries(
    Object.entries(groups).map(([columnId, tasks]) => [columnId, [...tasks]]),
  );
}

function groupsFromCategories(categories: TaskCategory[]): TaskGroups {
  return Object.fromEntries(
    categories.map((column) => [column.id, [...(column.boardTasks ?? [])]]),
  );
}

export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = typeof params.id === 'string' ? params.id : '';

  const { onOpen } = useModal();
  const queryClient = useQueryClient();
  const queryKey = ['workspace-kanban', workspaceId];

  const { data: categories, isLoading } = useWorkspaceKanban(workspaceId);
  const {
    data: documentCategories,
    isLoading: isDocumentsLoading,
    isError: isDocumentsError,
  } = useWorkspaceStructure(workspaceId);

  const createColumnMutation = useCreateColumn(workspaceId);
  const reorderTasksMutation = useReorderTasks(workspaceId);

  const [activeTab, setActiveTab] = useState<
    'documents' | 'kanban' | 'whiteboard'
  >('documents');

  const [dragGroups, setDragGroups] = useState<TaskGroups | null>(null);

  // whiteboard - тимчасовий локальний стан до інтеграції з бекендом
  //const [whiteboardElements, setWhiteboardElements] =
  //useState<WhiteboardElements>([]);

  const groupsRef = useRef<TaskGroups>({});
  const snapshotRef = useRef<TaskGroups | null>(null);
  const draggingRef = useRef(false);

  const handleDragStart = () => {
    if (!categories) return;

    const initialGroups = groupsFromCategories(categories);

    groupsRef.current = initialGroups;
    snapshotRef.current = cloneGroups(initialGroups);
    draggingRef.current = true;

    setDragGroups(initialGroups);

    void queryClient.cancelQueries({ queryKey });
  };

  const handleDragOver = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragOver']>
    >[0],
  ) => {
    if (!draggingRef.current) return;

    const nextGroups = move(groupsRef.current, event) as TaskGroups;

    const normalizedGroups: TaskGroups = Object.fromEntries(
      Object.entries(nextGroups).map(([columnId, tasks]) => [
        columnId,
        tasks.map((task) => ({
          ...task,
          columnId,
        })),
      ]),
    );

    groupsRef.current = normalizedGroups;
    setDragGroups(normalizedGroups);
  };

  // handler dnd - ua: хендлер для перетегувань таск
  const handleDragEnd = (
    event: Parameters<
      NonNullable<React.ComponentProps<typeof DragDropProvider>['onDragEnd']>
    >[0],
  ) => {
    if (event.canceled) {
      const snapshot = snapshotRef.current;

      if (snapshot) {
        const restoredGroups = cloneGroups(snapshot);
        groupsRef.current = restoredGroups;
        setDragGroups(null);
      }

      snapshotRef.current = null;
      draggingRef.current = false;
      return;
    }

    const source = event.operation.source;

    if (!source || !isSortable(source)) {
      snapshotRef.current = null;
      draggingRef.current = false;
      setDragGroups(null);
      return;
    }

    const initialColumnId = String(source.initialGroup ?? '');
    const destinationColumnId = String(source.group ?? '');

    const currentCategories =
      queryClient.getQueryData<TaskCategory[]>(queryKey);

    const snapshot = snapshotRef.current;

    snapshotRef.current = null;
    draggingRef.current = false;
    setDragGroups(null);

    if (
      !currentCategories ||
      !snapshot ||
      !initialColumnId ||
      !destinationColumnId
    ) {
      return;
    }

    const previousKanbanData = currentCategories.map((column) => ({
      ...column,
      boardTasks: [...(column.boardTasks ?? [])],
    }));

    const affectedColumns = new Set([initialColumnId, destinationColumnId]);

    const nextCategories = currentCategories.map((column) => {
      const tasks = groupsRef.current[column.id];

      if (!tasks) return column;

      return {
        ...column,
        boardTasks: tasks.map((task, index) => ({
          ...task,
          columnId: column.id,
          position: index,
        })),
      };
    });

    const reorderedTasks = nextCategories
      .filter((column) => affectedColumns.has(column.id))
      .flatMap((column) =>
        column.boardTasks.map((task, index) => ({
          id: task.id,
          position: index,
          columnId: column.id,
        })),
      );

    queryClient.setQueryData(queryKey, nextCategories);

    reorderTasksMutation.mutate({
      tasks: reorderedTasks,
      previousKanbanData,
    });
  };

  const handleAddColumn = () => {
    onOpen('createTaskColumn');
  };

  const displayedCategories = categories?.map((column) => ({
    ...column,
    boardTasks: dragGroups?.[column.id] ?? column.boardTasks ?? [],
  }));

  return (
    <div className="flex flex-1 flex-col p-6 h-full bg-background">
      <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-6">
        <div className="flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/10">
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FontAwesomeIcon icon={faFolderOpen} className="h-3.5 w-3.5" />
            <span>Documents</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'kanban'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FontAwesomeIcon icon={faTasks} className="h-3.5 w-3.5" />
            <span>Tasks Kanban</span>
          </button>

          {/* whiteboard - перехід до графічного полотна */}
          <button
            type="button"
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === 'whiteboard'
                ? 'bg-background text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FontAwesomeIcon icon={faChalkboard} className="h-3.5 w-3.5" />
            <span>Whiteboard</span>
          </button>
        </div>

        <div className="text-[10px] text-muted-foreground/40 font-mono tracking-wider bg-secondary/20 px-2.5 py-1 rounded-md border border-border/55">
          Workspace ID: {workspaceId}
        </div>
      </div>

      {/* fix: Add functional to doc page*/}
      {activeTab === 'documents' && (
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 text-left">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Documents
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse your knowledge base and organize documents by category.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpen('createCategory')}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
              <span>New Category</span>
            </button>
          </div>

          {isDocumentsLoading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Loading documents...
            </div>
          ) : isDocumentsError ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                Failed to load documents.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Please try again in a moment.
              </p>
            </div>
          ) : documentCategories?.length ? (
            <div className="space-y-6">
              {documentCategories.map((category) => (
                <section
                  key={category.id}
                  className="overflow-hidden rounded-2xl border border-border/60 bg-card/40"
                >
                  <div className="flex items-center gap-3 border-b border-border/40 bg-secondary/20 px-4 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <FontAwesomeIcon icon={faFolder} className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-bold text-foreground">
                        {category.name}
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {category.documents.length}{' '}
                        {category.documents.length === 1
                          ? 'document'
                          : 'documents'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onOpen('createDocument', {
                          categoryId: category.id,
                          categoryName: category.name,
                        })
                      }
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-xs font-semibold text-foreground transition  hover:text-primary"
                      title={`Add document to ${category.name}`}
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                      <span className="hidden sm:inline">Add Document</span>
                    </button>
                  </div>

                  {category.documents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                      {category.documents.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/workspaces/${workspaceId}/documents/${doc.id}`}
                          className="group flex min-w-0 items-center gap-3 rounded-xl border border-border/50 bg-background/50 p-3 transition hover:border-primary/30 hover:bg-accent/30"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FontAwesomeIcon
                              icon={faFileLines}
                              className="h-4 w-4"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                              {doc.title}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Open document
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="px-4 py-5 text-xs italic text-muted-foreground">
                      This category is empty.
                    </p>
                  )}
                </section>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <FontAwesomeIcon icon={faFolderOpen} className="h-5 w-5" />
              </div>

              <h3 className="mt-4 text-base font-bold text-foreground">
                Your knowledge base is empty
              </h3>

              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Create a category in the sidebar to start organizing your
                documents.
              </p>

              <button
                type="button"
                onClick={() => onOpen('createCategory')}
                className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                Create Category
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground/90">
              Sprint Task Board
            </h3>

            <button
              type="button"
              onClick={handleAddColumn}
              disabled={isLoading || createColumnMutation.isPending}
              className="flex items-center gap-2 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 active:scale-[0.98] transition cursor-pointer shadow-sm disabled:opacity-50"
            >
              <FontAwesomeIcon className="text-[10px]" icon={faPlus} />
              <span>Add Column</span>
            </button>
          </div>

          <DragDropProvider
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div
              className={`kanban-board-scroll flex-1 min-h-0 overflow-auto pb-4 flex items-start gap-4 select-none ${
                reorderTasksMutation.isPending ? 'pointer-events-none' : ''
              }`}
            >
              {isLoading ? (
                <div className="text-xs font-medium text-muted-foreground animate-pulse p-2">
                  Loading board structure...
                </div>
              ) : displayedCategories?.length ? (
                displayedCategories.map((column) => (
                  <BoardColumn
                    key={column.id}
                    column={column}
                    onAddTask={(columnId) =>
                      onOpen('createBoardTask', { columnId })
                    }
                  />
                ))
              ) : (
                <div className="text-xs italic text-muted-foreground/60 p-2">
                  Columns not yet created. Click &quot;Add Column&quot; to
                  initialize the board.
                </div>
              )}
            </div>
          </DragDropProvider>
        </div>
      )}

      {/* whiteboard component*/}
      {activeTab === 'whiteboard' && (
        <div className="flex-1 flex flex-col min-h-0 space-y-4 text-left">
          <div className="flex-1 min-h-[500px]">
            <WhiteboardWrapper workspaceId={workspaceId} />
          </div>
        </div>
      )}
    </div>
  );
}
