import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheck,
  faCloudArrowUp,
  faPen,
  faEye,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

export type WhiteboardSaveStatus = 'saving' | 'saved' | 'error';

interface WhiteboardHeaderProps {
  saveStatus: WhiteboardSaveStatus;
  isReadOnly: boolean;
  onToggleReadOnly: () => void;
}

const SAVE_STATUS_CONFIG = {
  saving: {
    label: 'Saving...',
    icon: faSpinner,
    className: 'text-muted-foreground',
  },
  saved: {
    label: 'All changes saved',
    icon: faCheck,
    className: 'text-emerald-500',
  },
  error: {
    label: 'Save failed',
    icon: faCloudArrowUp,
    className: 'text-destructive',
  },
} as const;

export default function WhiteboardHeader({
  saveStatus,
  isReadOnly,
  onToggleReadOnly,
}: WhiteboardHeaderProps) {
  const status = SAVE_STATUS_CONFIG[saveStatus];

  return (
    <header className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-semibold">Workspace Whiteboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualize ideas, map workflows, and collaborate.
        </p>

        <div
          className={`mt-2 flex items-center gap-2 text-xs ${status.className}`}
          aria-live="polite"
        >
          <FontAwesomeIcon icon={status.icon} spin={saveStatus === 'saving'} />
          <span>{status.label}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onToggleReadOnly}
        className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted sm:self-auto"
      >
        <FontAwesomeIcon icon={isReadOnly ? faPen : faEye} />
        {isReadOnly ? 'Edit board' : 'View board'}
      </button>
    </header>
  );
}
