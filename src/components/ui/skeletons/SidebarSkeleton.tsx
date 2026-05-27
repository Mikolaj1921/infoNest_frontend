import React from 'react';

// ua: скелетон для імітації завантаження дерева документів - sidebar skeleton
export const SidebarSkeleton = () => {
  return (
    <div className="space-y-4 px-3 py-2 animate-pulse">
      <div className="h-3 w-16 rounded bg-muted/60" />

      {/* ua: імітація папок та файлів */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted/80" />
        </div>
        <div className="flex items-center gap-2 ml-4 border-l border-border/40 pl-2">
          <div className="h-4 w-4 rounded bg-muted/60" />
          <div className="h-4 w-32 rounded bg-muted/50" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-muted" />
          <div className="h-4 w-24 rounded bg-muted/80" />
        </div>
      </div>
    </div>
  );
};
