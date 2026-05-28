import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faLock,
  faGlobe,
} from '@fortawesome/free-solid-svg-icons';
// ua: типи та інтерфейси для воркспейсів
import { Workspace, WorkspaceVisibility } from '@/types/workspace';

interface WorkspaceCardProps {
  workspace: Workspace;
}

// ua: компонент картки окремого воркспейсу для списку вибору
export const WorkspaceCard = ({ workspace }: WorkspaceCardProps) => {
  // ua: міні-логотип
  const firstLetter = workspace.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/workspaces/${workspace.id}`}
      className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-card/60 hover:shadow-2xl hover:shadow-primary/5 text-left"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {/* ua міні-іконка  */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 text-sm font-bold text-primary shadow-sm select-none">
            {firstLetter}
          </div>

          <div className="text-muted-foreground/40 text-xs">
            <FontAwesomeIcon
              icon={
                workspace.visibility === WorkspaceVisibility.PRIVATE
                  ? faLock
                  : faGlobe
              }
              className="h-3.5 w-3.5"
            />
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {workspace.name}
          </h3>
          <p className="text-[10px] font-mono text-muted-foreground/50 truncate">
            ID: {workspace.id}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        <span>Open space</span>
        <FontAwesomeIcon
          icon={faArrowRight}
          className="ml-1.5 h-3 w-3 transition-transform group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
};
