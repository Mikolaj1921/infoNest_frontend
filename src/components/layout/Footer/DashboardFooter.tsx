// ua: базовий футер для сторінки Dashboard (ai тимчасовий)

export const DashboardFooter = () => {
  return (
    <footer className="mt-auto border-t border-border py-4 px-6">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">
          infoNest Engine v1.0.0
        </div>
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          <span className="hover:text-foreground cursor-help">
            Status: Online
          </span>
          <span className="hover:text-foreground cursor-pointer">Support</span>
        </div>
      </div>
    </footer>
  );
};
