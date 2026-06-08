'use client';

// ua: для керування станом мобайл меню
import { useState } from 'react';
// ua: Імпорти навігації Next.js та Zustand-стору
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
// zustand store
import { useAuthUser } from '@/store/useAuthStore';
// workspace modal
import { CreateWorkspaceModal } from '@/features/workspaces/components/CreateWorkspaceModal';

// ua: custom hook для отримання структури воркспейсу (кат + док)
import { useWorkspaceStructure } from '@/features/documents/hooks/useWorkspaceStructure';
// ua: для відображення станів завантаження та помилок
import { SidebarSkeleton } from '@/components/ui/skeletons/SidebarSkeleton';
// ua: для відображення дерева навігації по кат + док
import { NavTree } from '@/features/documents/components/NavTree';

// Імпорти іконок
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faGear,
  faHouse,
  faMagnifyingGlass,
  faBars,
  faXmark,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';

export const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams(); // params route - get workspaceId
  const user = useAuthUser(); // ua: дані юзера з стору

  const workspaceId = typeof params?.id === 'string' ? params.id : ''; // get workspaceId from route params
  const { data: categories, isLoading } = useWorkspaceStructure(workspaceId); // state for workspace structure

  // ua: стан для мобільного сайдбару
  const [isOpen, setIsOpen] = useState(false);
  // ua: стан для модалки створення воркспейсу
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ua: навігаційна функція для визначення активного лінку
  const isActive = (path: string) => pathname === path;
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
          <div className="mb-2 px-3 flex items-center justify-between group/title select-none">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Structure
            </span>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="h-4 w-4 rounded text-muted-foreground/40 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-all cursor-pointer  group-hover/title:opacity-100 focus:opacity-100"
              title="Create new workspace"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            </button>
          </div>

          {/* ua: відображення дерева документів/скелетонів завантаження*/}
          {isLoading ? (
            <SidebarSkeleton />
          ) : categories && categories.length > 0 ? (
            <NavTree categories={categories} />
          ) : (
            <div className="px-3 py-2 text-xs text-muted-foreground/30 italic text-left select-none">
              No categories found
            </div>
          )}
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
            <span>Settings</span>
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
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};
// ua: ініціалізація аватару
export const getInitials = (nameString?: string) => {
  if (!nameString) return 'IN';
  const parts = nameString.split(' ');
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameString.slice(0, 2).toUpperCase();
};
