// component - loader

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

interface WhiteboardLoadingStateProps {
  message?: string;
}

export default function WhiteboardLoadingState({
  message = 'Loading whiteboard...',
}: WhiteboardLoadingStateProps) {
  return (
    <div className="flex min-h-[240px] h-full w-full items-center justify-center rounded-xl border border-border bg-background p-6">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <FontAwesomeIcon icon={faSpinner} spin className="text-2xl" />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
