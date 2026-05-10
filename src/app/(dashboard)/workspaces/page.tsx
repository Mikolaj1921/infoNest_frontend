export default function TestPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Tестова сторінка воркспейсів</h1>
      <p className="text-muted-foreground">Сабтаска 3 працює</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-32 rounded-xl bg-card border border-border p-4">
          Картка 1
        </div>
        <div className="h-32 rounded-xl bg-card border border-border p-4">
          Картка 2
        </div>
      </div>
    </div>
  );
}
