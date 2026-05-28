import React from 'react';

// ua: базовий універсальний скелетон однієї картки
export const CardSkeleton = () => {
  return (
    <div className="h-[148px] rounded-2xl border border-border/50 bg-card/20 p-6 space-y-4 animate-pulse">
      <div className="h-10 w-10 rounded-xl bg-muted/60" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted/50" />
        <div className="h-3 w-24 rounded bg-muted/30" />
      </div>
    </div>
  );
};
