import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faFolderPlus } from '@fortawesome/free-solid-svg-icons';

// ua: компонент заглушки, коли у користувача немає жодного воркспейсу
export const WorkspacesEmptyState = () => {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-card/10 backdrop-blur-sm mx-auto my-12 animate-in fade-in duration-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-4 shadow-inner">
        <FontAwesomeIcon icon={faFolderPlus} className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-bold text-foreground">No workspaces found</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        A workspace is where your second brain stores categorized knowledge,
        files, and documents. Create your first one to get started.
      </p>
      <button className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80  transition-all cursor-pointer shadow-lg duration-300">
        <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
        <span>Create your first workspace</span>
      </button>
    </div>
  );
};
