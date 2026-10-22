// error component

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface WhiteboardErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function WhiteboardErrorState({
  message = 'Something went wrong while loading the whiteboard.',
  onRetry,
}: WhiteboardErrorStateProps) {
  return (
    <div className="flex min-h-[240px] h-full w-full items-center justify-center rounded-xl border border-border bg-background p-6">
      <div className="flex max-w-md flex-col items-center gap-3 text-center">
        <FontAwesomeIcon
          icon={faExclamationTriangle}
          className="text-2xl text-destructive"
        />

        <p className="text-sm text-muted-foreground">{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
