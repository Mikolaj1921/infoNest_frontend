'use client';

import {
  Component,
  type ComponentProps,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';

type ExcalidrawProps = ComponentProps<typeof Excalidraw>;

type ExcalidrawOnChange = NonNullable<ExcalidrawProps['onChange']>;

export type WhiteboardElements = Parameters<ExcalidrawOnChange>[0];

export type WhiteboardElement = WhiteboardElements[number];

interface WhiteboardCanvasProps {
  elements: WhiteboardElements;
  onChange: (elements: WhiteboardElements) => void;
  isReadOnly?: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CanvasErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Whiteboard canvas error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-[500px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-background p-6 text-center"
        >
          <p className="text-sm font-semibold text-destructive">
            Failed to open the canvas
          </p>

          <p className="max-w-sm text-xs text-muted-foreground">
            An error occurred while initializing the board. Try reloading the
            page.
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-lg border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-accent"
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function WhiteboardCanvas({
  elements,
  onChange,
  isReadOnly = false,
}: WhiteboardCanvasProps) {
  return (
    <CanvasErrorBoundary>
      <div className="relative h-full min-h-[500px] w-full overflow-hidden rounded-2xl border border-border/40 bg-background">
        <Excalidraw
          initialData={{
            elements: [...elements],
            appState: {
              viewModeEnabled: isReadOnly,
            },
          }}
          viewModeEnabled={isReadOnly}
          onChange={(nextElements) => {
            if (isReadOnly) return;

            onChange(nextElements);
          }}
        />
      </div>
    </CanvasErrorBoundary>
  );
}
