import React from 'react';
import { CardSkeleton } from '@/components/ui/skeletons/CardSkeleton';

// ua: скелетон для імітації завантаження сітки воркспейсів
export const WorkspacesSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left animate-pulse">
        <div className="h-7 w-48 rounded-lg bg-muted/60" />
        <div className="h-4 w-72 rounded-md bg-muted/40" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <CardSkeleton key={item} />
        ))}
      </div>
    </div>
  );
};
