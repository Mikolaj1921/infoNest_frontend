// ua: ai тимчасовий сайдбар для навігації по структурі

// Імпорти іконок
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faFolder,
  faFileLines,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

// Сайдбар для навігації по структурі
export const Sidebar = () => {
  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card/30 backdrop-blur-xl">
      {/*  Workspace Switcher */}
      <div className="p-4">
        <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background/50 p-2 text-sm font-semibold hover:bg-accent transition-colors">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] text-primary-foreground">
              IN
            </div>
            <span className="truncate">infoNest Space</span>
          </div>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="h-3 w-3 text-muted-foreground"
          />
        </button>
      </div>

      {/* Navigation Tree  */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          Struktura
        </div>

        {/* Приклад категорії (Folder) */}
        <div className="space-y-1">
          <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <FontAwesomeIcon icon={faFolder} className="h-3.5 w-3.5" />
            <span>Projekty</span>
          </button>

          {/* Приклад документа всередині (File) */}
          <div className="ml-4 border-l border-border pl-2 space-y-1">
            <button className="flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-sm text-primary bg-primary/10">
              <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5" />
              <span className="truncate">Plan MVP</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. User & Settings Footer */}
      <div className="border-t border-border p-4 space-y-2">
        <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <FontAwesomeIcon icon={faGear} />
          <span>Ustawienia</span>
        </button>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            MM
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold truncate">Mikołaj Melnyk</span>
            <span className="text-[10px] text-muted-foreground truncate">
              mikolaj@nest.pl
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
