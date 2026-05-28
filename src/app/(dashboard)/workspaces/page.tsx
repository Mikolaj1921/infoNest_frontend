'use client';

// import icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// ua: Імпорти логіки, хуків та компонентів фічі воркспейсів
import { useWorkspaces } from '@/features/workspaces/hooks/useWorkspaces';

// ua: компоненти для відображення станів завантаження та порожнього стану
import { WorkspaceCard } from '@/features/workspaces/components/WorkspaceCard';
import { WorkspacesSkeleton } from '@/features/workspaces/components/WorkspacesSkeleton';
import { WorkspacesEmptyState } from '@/features/workspaces/components/WorkspacesEmptyState';

export default function WorkspacesPage() {
  // ua: отримання даних воркспейсів та стани завантаження/помилок через кастом-хук
  const { data: workspaces, isLoading } = useWorkspaces();

  // loading state
  if (isLoading) {
    return <WorkspacesSkeleton />;
  }

  // empty state
  if (!workspaces || workspaces.length === 0) {
    return <WorkspacesEmptyState />;
  }

  // ua: основний UI для відображення списку воркспейсів користувача
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-0.5 text-left">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Workspaces
          </h1>
          <p className="text-sm text-muted-foreground">
            Select a workspace to access your structured database
          </p>
        </div>
        <button className="flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90 transition-all cursor-pointer shrink-0">
          <FontAwesomeIcon icon={faPlus} />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces.map((workspace) => (
          <WorkspaceCard key={workspace.id} workspace={workspace} />
        ))}
      </div>
    </div>
  );
}
