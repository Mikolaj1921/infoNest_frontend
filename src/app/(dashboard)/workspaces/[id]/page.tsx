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
  useCreateTask,
} from '@/hooks/useKanbanData';
import { BoardColumn } from '@/features/kanban/components/BoardColumn';

// ua: Головний компонент сторінки воркспейсу. Ключове слово export default є ОБОВ'ЯЗКОВИМ!
export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  // ua: Локальний стейт для керування активною вкладкою (Документи або Задачі)
  const [activeTab, setActiveTab] = useState<'documents' | 'kanban'>(
    'documents',
  );

  // ua: Завантаження даних дошки та мутації через TanStack Query хуки фічі
  const { data: categories, isLoading } = useWorkspaceKanban(workspaceId);
  const createColumnMutation = useCreateColumn(workspaceId);
  const createTaskMutation = useCreateTask(workspaceId);

  // ua: Функція швидкого створення нової колонки через prompt вікно браузера
  const handleAddColumn = () => {
    const columnName = prompt('Введіть назву для нової колонки задач:');
    if (columnName && columnName.trim()) {
      createColumnMutation.mutate(columnName.trim());
    }
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

      {/* --- РЕЖИМ 1: СТАНДАРТНЕ ВІДОБРАЖЕННЯ ДОКУМЕНТІВ (ТВОЯ ЗАГЛУШКА) --- */}
      {activeTab === 'documents' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="max-w-md space-y-4">
            {/* Красива заглушка робочої зони воркспейсу */}
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

      {/* --- РЕЖИМ 2: СУЧАСНИЙ ГОРИЗОНТАЛЬНИЙ LAYOUT КАНБАН-ДОШКИ --- */}
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

          {/* ua: Горизонтальний скрол-контейнер для відображення колонок фічі канбану */}
          <div className="flex-1 overflow-x-auto pb-4 flex items-start gap-4 select-none min-h-[450px] scrollbar-thin scrollbar-thumb-border/60">
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
                    const title = prompt('Enter task title:');
                    if (title && title.trim()) {
                      createTaskMutation.mutate({
                        title: title.trim(),
                        columnId,
                        workspaceId,
                      });
                    }
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
