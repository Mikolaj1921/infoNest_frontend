// comp whiteboard

'use client';

import dynamic from 'next/dynamic';
import WhiteboardHeader from './WhiteboardHeader';
import WhiteboardLoadingState from './WhiteboardLoadingState';
import WhiteboardErrorState from './WhiteboardErrorState';
import WhiteboardErrorBoundary from './WhiteboardErrorBoundary';
import { useWhiteboardController } from '../hooks/useWhiteboardController';

// ua: динамічний імпорт Excalidraw, щоб завантажувати Canvas на клієнті
const DynamicCanvas = dynamic(() => import('./WhiteboardCanvas'), {
  ssr: false,
  loading: () => (
    <WhiteboardLoadingState message="Loading whiteboard canvas..." />
  ),
});

interface WhiteboardWrapperProps {
  workspaceId: string;
}

export default function WhiteboardWrapper({
  workspaceId,
}: WhiteboardWrapperProps) {
  const {
    whiteboard,
    role,
    canEdit,
    elements,
    appState,
    isLoading,
    isError,
    isReadOnly,
    saveStatus,
    setIsReadOnly,
    retryLoading,
    handleChange,
    handleThemeChange,
  } = useWhiteboardController(workspaceId);

  if (isLoading) {
    return <WhiteboardLoadingState message="Loading whiteboard..." />;
  }

  if (isError || !whiteboard) {
    return (
      <WhiteboardErrorState
        message="Unable to load the whiteboard. Please try again."
        onRetry={retryLoading}
      />
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col gap-4">
      <WhiteboardHeader
        saveStatus={saveStatus}
        isReadOnly={isReadOnly}
        onToggleReadOnly={
          canEdit ? () => setIsReadOnly(!isReadOnly) : undefined
        }
      />

      {!canEdit && (
        <p className="text-sm text-muted-foreground">
          View-only access
          {role ? ` (${role})` : ''}
        </p>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl">
        <WhiteboardErrorBoundary>
          <DynamicCanvas
            elements={elements}
            appState={appState}
            onChange={handleChange}
            onThemeChange={handleThemeChange}
            isReadOnly={isReadOnly}
          />
        </WhiteboardErrorBoundary>
      </div>

      <footer className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {canEdit
            ? 'Changes are saved automatically after 2 seconds.'
            : 'You have read-only access to this whiteboard.'}
        </p>
        <p>Board ID: {whiteboard.id}</p>
      </footer>
    </section>
  );
}
