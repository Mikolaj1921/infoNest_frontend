// FullPageLoader - лоудер, показується під час завантаження
// програми або при переході між сторінками

export const FullPageLoader = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background">
      <div className="relative">
        {/* effect pulse */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />

        {/* logo */}
        <div className="relative flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-card border border-border text-4xl shadow-2xl shadow-primary/10">
          🪹
        </div>
      </div>
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
        infoNest is initializing
      </p>
    </div>
  );
};
