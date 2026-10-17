'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFolderOpen,
  faTasks,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import {
  useWorkspaceKanban,
  useCreateColumn,
  //useCreateTask,
} from '@/hooks/useKanbanData';
import { BoardColumn } from '@/features/kanban/components/BoardColumn';
import { useModal } from '@/hooks/use-modal-store';

export default function WorkspacePage() {
  const params = useParams();
  const { onOpen } = useModal(); // global modal store for opening modals

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  // local state to manage the active tab between doc & kanban view
  const [activeTab, setActiveTab] = useState<'documents' | 'kanban'>(
    'documents',
  );

  // ua: Завантаження даних дошки та мутації через TanStack Query хуки фічі
  const { data: categories, isLoading } = useWorkspaceKanban(workspaceId);
  const createColumnMutation = useCreateColumn(workspaceId);
  //const createTaskMutation = useCreateTask(workspaceId);

  // update: handle opening the modal for creating a new task column
  const handleAddColumn = () => {
    onOpen('createTaskColumn');
  };

  return (
    <div className="flex flex-1 flex-col p-6 h-full bg-background animate-in fade-in duration-300">
      {/* апдейт: верхній перемикач між режимами */}
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
        </div>

        <div className="text-[10px] text-muted-foreground/40 font-mono tracking-wider bg-secondary/20 px-2.5 py-1 rounded-md border border-border/55">
          Workspace ID: {workspaceId}
        </div>
      </div>

      {/* ua: Відображення вкладки документів - заглушка */}
      {activeTab === 'documents' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="max-w-md space-y-4">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <FontAwesomeIcon icon={faFolderOpen} className="h-5 w-5" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Welcome to your workspace!
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Select an existing document in the left sidebar or create a new
                folder to start organizing your knowledge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ua: Відображення вкладки канбан - заглушка */}
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
              <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
              <span>Add Column</span>
            </button>
          </div>

          {/* ua: скрол-контейнер для відображення колонок фічі канбану */}
          <div className="kanban-board-scroll flex-1 min-w-0 overflow-x-auto pb-4 flex items-start gap-4 select-none min-h-[450px]">
            {isLoading ? (
              <div className="text-xs font-medium text-muted-foreground animate-pulse p-2">
                Loading board structure...
              </div>
            ) : categories && categories.length > 0 ? (
              categories.map((col) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  onAddTask={(columnId) => {
                    // modal store
                    onOpen('createBoardTask', { columnId });
                  }}
                />
              ))
            ) : (
              <div className="text-xs italic text-muted-foreground/60 p-2">
                Columns not yet created. Click &quot;Add Column&quot; to
                initialize the board.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
