'use client';

// ua: для керування станом мобайл меню
import { useState } from 'react';
// ua: Імпорти навігації Next.js та Zustand-стору
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// zustand store
import { useAuthUser } from '@/store/useAuthStore';

// Імпорти іконок
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faFolder,
  faFileLines,
  faGear,
  faHouse,
  faMagnifyingGlass,
  faBars,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar = () => {
  const pathname = usePathname();
  const user = useAuthUser(); // ua: дані юзера з стору
  // ua: стан для мобільного сайдбару
  const [isOpen, setIsOpen] = useState(false);

  // ua: ініціалізація аватару
  const getInitials = (nameString?: string) => {
    if (!nameString) return 'IN';
    const parts = nameString.split(' ');
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return nameString.slice(0, 2).toUpperCase();
  };

  // ua: навігаційна функція для визначення активного лінку
  const isActive = (path: string) => pathname === path;

  // ua: функція для перевірки, чи поточний шлях починається з певного підмаршруту (наприклад, для документів)
  const isChildActive = (path: string) => pathname.startsWith(path);

  // ua: функція для закриття мобільного меню після кліку
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* mobile menu toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-3 left-4 z-50 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background/80 text-foreground backdrop-blur-md hover:bg-accent md:hidden cursor-pointer transition-colors"
        aria-label="Toggle Menu"
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-4 w-4" />
      </button>

      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Сайдбар для навігації по структурі */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 md:bg-card/30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/*  Workspace Switcher */}
        <div className="p-4 border-b border-border/40 flex items-center h-16 md:h-auto pl-16 md:pl-4">
          <button className="flex w-full items-center justify-between rounded-lg border border-border bg-background/50 p-2 text-sm font-semibold hover:bg-accent/10 transition-colors cursor-pointer group w-full">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-[10px] text-primary-foreground font-bold">
                IN
              </div>
              <span className="truncate text-foreground group-hover:text-primary transition-colors">
                infoNest Space
              </span>
            </div>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-3 w-3 text-muted-foreground"
            />
          </button>
        </div>

        {/* ua: Головні навігаційні лінки (Home, Search) */}
        <div className="px-3 pt-4 space-y-1">
          <Link
            href="/workspaces"
            onClick={closeMenu}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/workspaces')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
            <span>Home</span>
          </Link>

          <button
            onClick={closeMenu}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer text-left"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
            <span>Search</span>
            <kbd className="ml-auto pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Navigation Tree  */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            Struktura
          </div>

          {/* (Folder) */}
          <div className="space-y-1">
            <Link
              href="/workspaces/info-nest/projects"
              onClick={closeMenu}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive('/workspaces/info-nest/projects')
                  ? 'bg-accent text-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <FontAwesomeIcon
                icon={faFolder}
                className="h-3.5 w-3.5 text-primary/70"
              />
              <span>Projekty</span>
            </Link>

            {/* (File) */}
            <div className="ml-4 border-l border-border pl-2 space-y-1">
              <Link
                href="/workspaces/info-nest/documents/plan-mvp"
                onClick={closeMenu}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isChildActive('/workspaces/info-nest/documents/plan-mvp')
                    ? 'bg-primary/10 text-primary font-semibold'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <FontAwesomeIcon icon={faFileLines} className="h-3.5 w-3.5" />
                <span className="truncate">Plan MVP</span>
              </Link>
            </div>
          </div>
        </nav>

        {/*  User & Settings Footer */}
        <div className="border-t border-border p-4 space-y-2 bg-background/20">
          <Link
            href="/profile"
            onClick={closeMenu}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive('/profile')
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <FontAwesomeIcon icon={faGear} className="h-4 w-4" />
            <span>Ustawienia</span>
          </Link>

          <div className="flex items-center gap-3 px-2 py-2 border border-border/50 bg-background/40 rounded-xl shadow-inner">
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-xs font-bold text-primary select-none shrink-0 shadow-sm">
              {getInitials(user?.name)}
            </div>
            <div className="flex flex-col overflow-hidden text-left">
              <span className="text-xs font-bold text-foreground truncate">
                {user?.name || 'Loading user...'}
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                {user?.email || 'email@example.com'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
