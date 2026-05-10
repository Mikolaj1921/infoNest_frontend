// ua: базовий лоудер для сторінки Dashboard

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-1/4 rounded-lg bg-muted" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-40 rounded-2xl border border-border bg-card/50"
          />
        ))}
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-12 w-full rounded-xl border border-border bg-card/30"
          />
        ))}
      </div>
    </div>
  );
}
