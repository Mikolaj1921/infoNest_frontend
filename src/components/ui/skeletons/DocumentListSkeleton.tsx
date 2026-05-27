import React from 'react';

// ua: скелетон для карток на Dashboard pages
export const DocumentListSkeleton = () => {
  return (
    <div className="space-y-3 animate-pulse w-full">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center justify-between h-12 w-full rounded-xl border border-border/50 bg-card/20 px-4"
        >
          <div className="flex items-center gap-3 w-2/3">
            <div className="h-4 w-4 rounded bg-muted" />
            <div className="h-4 w-full max-w-[180px] rounded bg-muted/80" />
          </div>
          <div className="h-3 w-16 rounded bg-muted/40" />
        </div>
      ))}
    </div>
  );
};
