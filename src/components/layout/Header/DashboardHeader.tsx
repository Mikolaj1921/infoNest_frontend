// ua: базовий хедер для сторінки Dashboard (ai тимчасовий)

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faBell,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

// ua: базовий хедер для сторінки Dashboard
export const DashboardHeader = () => {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-background/50 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Workspaces</span>
        <span className="text-border">/</span>
        <span className="font-medium text-foreground">infoNest Space</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent transition-colors">
          <FontAwesomeIcon icon={faSearch} />
          <span>Szukaj...</span>
          <kbd className="ml-2 rounded bg-background px-1.5 py-0.5 text-[10px] border border-border">
            Ctrl K
          </kbd>
        </button>

        <div className="relative cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
          <FontAwesomeIcon icon={faBell} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary border-2 border-background"></span>
        </div>

        <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all">
          <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
          Zaproś
        </button>
      </div>
    </header>
  );
};
