'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faLock,
  faGlobe,
  faEllipsisVertical,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';

// ua: типи та інтерфейси для воркспейсів
import { Workspace, WorkspaceVisibility } from '@/types/workspace';

// ua: поточний користувач
import { useAuthUser } from '@/store/useAuthStore';

// ua: відкриття модальних вікон
import { useModal } from '@/hooks/use-modal-store';

interface WorkspaceCardProps {
  workspace: Workspace;
}

// ua: компонент картки окремого воркспейсу для списку вибору
export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  const firstLetter = workspace.name.charAt(0).toUpperCase();

  const user = useAuthUser();
  const { onOpen } = useModal();

  const [isActionsOpen, setIsActionsOpen] = useState(false);

  // ua: посилання на контейнер кнопки та меню
  const actionsRef = useRef<HTMLDivElement>(null);

  // ua: перевірка власника воркспейсу
  const isOwner = workspace.ownerId === user?.id;

  // ua: закриття меню при кліку за його межами або натисканні Escape
  useEffect(() => {
    if (!isActionsOpen) return;

    const handleOutsideClick = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        actionsRef.current &&
        !actionsRef.current.contains(target)
      ) {
        setIsActionsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsActionsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isActionsOpen]);

  // ua: перейменування воркспейсу
  const handleEdit = () => {
    setIsActionsOpen(false);

    onOpen('editWorkspace', {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    });
  };

  // ua: видалення воркспейсу
  const handleDelete = () => {
    setIsActionsOpen(false);

    onOpen('deleteWorkspace', {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
    });
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-6 text-left backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5">
      {/* ua: меню керування воркспейсом для власника */}
      {isOwner && (
        <div ref={actionsRef} className="absolute right-5 top-5 z-20">
          <button
            type="button"
            onClick={() => setIsActionsOpen((previous) => !previous)}
            className={`flex h-7 w-7 items-center justify-center rounded-lg border border-border/50 bg-card text-muted-foreground transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isActionsOpen
                ? 'border-border bg-accent text-foreground'
                : 'hover:bg-accent hover:text-foreground'
            }`}
            aria-label={`Workspace actions for ${workspace.name}`}
            aria-expanded={isActionsOpen}
            aria-haspopup="menu"
            title="Workspace actions"
          >
            <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
          </button>

          {isActionsOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-40 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card p-1 shadow-xl backdrop-blur-md"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleEdit}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-foreground  hover:bg-accent"
              >
                <FontAwesomeIcon
                  icon={faPen}
                  className="h-3 w-3 text-muted-foreground"
                />
                <span>Rename</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-destructive transition-colors hover:bg-destructive/10"
              >
                <FontAwesomeIcon icon={faTrash} className="h-3 w-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ua: основний вміст картки */}
      <Link
        href={`/workspaces/${workspace.id}`}
        className="flex flex-1 flex-col justify-between"
      >
        <div className="space-y-4">
          {/* ua: міні-іконка воркспейсу */}
          <div className="flex items-center">
            <div className="flex h-10 w-10 select-none items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-sm font-bold text-primary shadow-sm">
              {firstLetter}
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
              {workspace.name}
            </h3>
            <p className="truncate font-mono text-[10px] text-muted-foreground/50">
              ID: {workspace.id}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          <div className="flex items-center gap-2">
            <span>Open space</span>
            <FontAwesomeIcon
              icon={faArrowRight}
              className="h-3 w-3 transition-transform group-hover:translate-x-1"
            />
          </div>

          {/* ua: індикатор приватності воркспейсу */}
          <span
            className="text-muted-foreground/40"
            title={
              workspace.visibility === WorkspaceVisibility.PRIVATE
                ? 'Private workspace'
                : 'Public workspace'
            }
          >
            <FontAwesomeIcon
              icon={
                workspace.visibility === WorkspaceVisibility.PRIVATE
                  ? faLock
                  : faGlobe
              }
              className="h-3.5 w-3.5"
            />
          </span>
        </div>
      </Link>
    </div>
  );
};
