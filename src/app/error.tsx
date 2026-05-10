'use client';
// use client - мусить бути в лайві - бо це глобально

export default function GlobalError({
  // eslint-disable-next-line
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive mb-6">
        <span className="text-4xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold">Something went wrong!</h2>
      <p className="mt-2 text-sm text-muted-foreground max-w-xs">
        An unexpected error has occurred. Please try refreshing the page or come
        back later.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg border border-border bg-card px-6 py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
