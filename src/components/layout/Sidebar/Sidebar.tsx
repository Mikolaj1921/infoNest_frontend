'use client';

// ua: для керування станом мобайл меню
import { useState } from 'react';
// ua: Імпорти навігації Next.js та Zustand-стору
import Link from 'next/link';
import { useParams, usePathname, useSearchParams } from 'next/navigation';
// zustand store
import { useAuthUser } from '@/store/useAuthStore';
// ua: custom hook для отримання списку воркспейсів
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';

// ua: UI components
import { useModal } from '@/hooks/use-modal-store';

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
  faChevronRight,
  faGear,
  faHouse,
  faMagnifyingGlass,
  faBars,
  faXmark,
  faPlus,
  faFolderOpen,
  faTasks,
  faChalkboard,
} from '@fortawesome/free-solid-svg-icons';

type WorkspaceSection = 'documents' | 'kanban' | 'whiteboard';

type WorkspaceNavigationProps = {
  workspace: {
    id: string;
    name: string;
  };
  isExpanded: boolean;
  activeWorkspaceId: string;
  activeSection: WorkspaceSection;
  onToggle: () => void;
  onSectionClick: () => void;
  onCreateCategory: () => void;
};

// ua: дерево документів конкретного воркспейсу
const WorkspaceDocuments = ({
  workspaceId,
  isActiveWorkspace,
}: {
  workspaceId: string;
  isActiveWorkspace: boolean;
}) => {
  const { data: categories, isLoading } = useWorkspaceStructure(workspaceId);

  if (isLoading) {
    return <SidebarSkeleton />;
  }

  if (!categories || categories.length === 0) {
    return (
      <div className="px-3 py-2 text-xs italic text-muted-foreground/50">
        No categories found
      </div>
    );
  }

  return (
    <div>
      {isActiveWorkspace && (
        <div className="mb-1 flex justify-end px-2">
          <button
            type="button"
            onClick={() => {
              // Створення категорії викликається через modal store
              window.dispatchEvent(new CustomEvent('infonest:create-category'));
            }}
            className="hidden"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}
      <NavTree categories={categories} />
    </div>
  );
};

// ua: навігація всередині окремого воркспейсу
const WorkspaceNavigation = ({
  workspace,
  isExpanded,
  activeWorkspaceId,
  activeSection,
  onToggle,
  onSectionClick,
  onCreateCategory,
}: WorkspaceNavigationProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActiveWorkspace = activeWorkspaceId === workspace.id;
  const currentTab = searchParams.get('tab');
  const selectedSection: WorkspaceSection =
    currentTab === 'kanban' || currentTab === 'whiteboard'
      ? currentTab
      : 'documents';

  const workspaceHref = `/workspaces/${workspace.id}`;

  const sections: {
    id: WorkspaceSection;
    label: string;
    icon: typeof faFolderOpen;
    tab?: string;
  }[] = [
    {
      id: 'documents',
      label: 'Documents',
      icon: faFolderOpen,
    },
    {
      id: 'kanban',
      label: 'Tasks (Kanban)',
      icon: faTasks,
      tab: 'kanban',
    },
    {
      id: 'whiteboard',
      label: 'Whiteboard',
      icon: faChalkboard,
      tab: 'whiteboard',
    },
  ];

  return (
    <div className="mb-1">
      {/* ua: кнопка розгортання воркспейсу */}
      <button
        type="button"
        onClick={onToggle}
        className={`group flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium ${
          isActiveWorkspace
            ? 'text-foreground'
            : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
        }`}
        aria-expanded={isExpanded}
      >
        <FontAwesomeIcon
          icon={isExpanded ? faChevronDown : faChevronRight}
          className="h-3 w-3 shrink-0 text-muted-foreground"
        />

        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
          {getInitials(workspace.name)}
        </span>

        <span className="min-w-0 flex-1 truncate">{workspace.name}</span>
      </button>

      {/* ua: розділи воркспейсу */}
      {isExpanded && (
        <div className="ml-3 border-l border-border/60 pl-2">
          {sections.map((section) => {
            const href = section.tab
              ? `${workspaceHref}?tab=${section.tab}`
              : workspaceHref;

            const isSelected =
              pathname === workspaceHref &&
              isActiveWorkspace &&
              selectedSection === section.id &&
              activeSection === section.id;

            return (
              <div key={section.id}>
                <div className="flex items-center gap-1">
                  <Link
                    href={href}
                    onClick={onSectionClick}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                      isSelected
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent/20 hover:text-foreground'
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={section.icon}
                      className="h-3.5 w-3.5 shrink-0"
                    />
                    <span className="truncate">{section.label}</span>
                  </Link>

                  {section.id === 'documents' && isActiveWorkspace && (
                    <button
                      type="button"
                      onClick={onCreateCategory}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent/20 hover:text-foreground"
                      title="Створити папку"
                      aria-label={`Створити папку у ${workspace.name}`}
                    >
                      <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* ua: дерево категорій і документів */}
                {section.id === 'documents' && (
                  <div className="ml-2">
                    <WorkspaceDocuments
                      workspaceId={workspace.id}
                      isActiveWorkspace={isActiveWorkspace}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Sidebar = () => {
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const user = useAuthUser();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // ua: стан для мобільного сайдбару
  const [isOpen, setIsOpen] = useState(false);

  // ua: зберігаємо стан розгортання кожного воркспейсу
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<
    Record<string, boolean>
  >({});

  // modal store
  const { onOpen } = useModal();

  const tabParam = searchParams.get('tab');
  const activeSection: WorkspaceSection =
    tabParam === 'kanban' || tabParam === 'whiteboard' ? tabParam : 'documents';

  // ua: навігаційна функція для визначення активного лінку
  const isActive = (path: string) => pathname === path;

  // ua: функція для закриття мобільного меню після кліку
  const closeMenu = () => setIsOpen(false);

  // ua: розгортання або згортання воркспейсу
  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  return (
    <>
      {/* mobile menu toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-3 z-50 flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background/80 text-foreground backdrop-blur-md transition-colors hover:bg-accent md:hidden"
        aria-label="Toggle Menu"
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={isOpen ? faXmark : faBars} className="h-4 w-4" />
      </button>

      <div
        onClick={closeMenu}
        className={`fixed inset-0 z-40 bg-background/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Сайдбар для навігації по воркспейсах */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 md:static md:translate-x-0 md:bg-card/30
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Workspace Switcher */}
        <div className="flex h-16 items-center border-b border-border/40 p-4 pl-16 md:h-auto md:pl-4">
          <Link
            href="/workspaces"
            onClick={closeMenu}
            className="group flex w-full items-center justify-between rounded-lg border border-border bg-background/50 p-2 text-sm font-semibold transition-colors hover:bg-accent/10"
          >
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-[10px] font-bold text-primary-foreground">
                IN
              </div>
              <span className="truncate text-foreground transition-colors group-hover:text-primary">
                infoNest Space
              </span>
            </div>

            <FontAwesomeIcon
              icon={faChevronDown}
              className="h-3 w-3 text-muted-foreground"
            />
          </Link>
        </div>

        {/* ua: Головні навігаційні лінки (Home, Search) */}
        <div className="space-y-1 px-3 pt-4">
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
            type="button"
            onClick={closeMenu}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4" />
            <span>Search</span>
            <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border border-border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground shadow-sm sm:inline-flex">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* ua: Список воркспейсів та їхні розділи */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="mb-2 flex select-none items-center justify-between px-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Workspaces
            </span>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              title="Створити воркспейс"
              aria-label="Створити воркспейс"
            >
              <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
            </button>
          </div>

          {isWorkspacesLoading ? (
            <SidebarSkeleton />
          ) : workspaces && workspaces.length > 0 ? (
            workspaces.map((workspace) => (
              <WorkspaceNavigation
                key={workspace.id}
                workspace={workspace}
                isExpanded={
                  workspace.id === workspaceId ||
                  Boolean(expandedWorkspaces[workspace.id])
                }
                activeWorkspaceId={workspaceId}
                activeSection={
                  workspace.id === workspaceId ? activeSection : 'documents'
                }
                onToggle={() => toggleWorkspace(workspace.id)}
                onSectionClick={closeMenu}
                onCreateCategory={() => onOpen('createCategory')}
              />
            ))
          ) : (
            <div className="px-3 py-2 text-left text-xs italic text-muted-foreground/50">
              No workspaces found
            </div>
          )}
        </nav>

        {/* User & Settings Footer */}
        <div className="space-y-2 border-t border-border bg-background/20 p-4">
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

          <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/40 px-2 py-2 shadow-inner">
            <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-xs font-bold text-primary shadow-sm">
              {getInitials(user?.name)}
            </div>

            <div className="flex min-w-0 flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-bold text-foreground">
                {user?.name || 'Loading user...'}
              </span>
              <span className="truncate text-[10px] text-muted-foreground">
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

  const parts = nameString.trim().split(/\s+/);

  if (parts.length > 1) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return nameString.slice(0, 2).toUpperCase();
};
