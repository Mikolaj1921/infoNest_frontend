// canvas whiteboard

'use client';

import {
  Component,
  type ComponentProps,
  type ErrorInfo,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import '@excalidraw/excalidraw/index.css';

// types
type ExcalidrawProps = ComponentProps<typeof Excalidraw>;
type ExcalidrawOnChange = NonNullable<ExcalidrawProps['onChange']>;
type ExcalidrawAPI = Parameters<
  NonNullable<ExcalidrawProps['excalidrawAPI']>
>[0];

export type WhiteboardElements = Parameters<ExcalidrawOnChange>[0];
export type WhiteboardElement = WhiteboardElements[number];
export type WhiteboardAppState = Partial<Parameters<ExcalidrawOnChange>[1]>;
export type WhiteboardTheme = 'light' | 'dark';

export interface WhiteboardContent {
  elements: WhiteboardElements;
  appState: WhiteboardAppState;
}

interface WhiteboardCanvasProps {
  elements: WhiteboardElements;
  appState: WhiteboardAppState;
  onChange: (
    elements: WhiteboardElements,
    appState: WhiteboardAppState,
  ) => void;
  onThemeChange: (theme: WhiteboardTheme) => void;
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
        <div className="flex h-full min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-background p-6 text-center">
          <p className="font-medium text-foreground">
            Failed to load the board
          </p>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page. If the error persists, check the console.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// canvas comp
export default function WhiteboardCanvas({
  elements,
  appState,
  onChange,
  onThemeChange,
  isReadOnly = false,
}: WhiteboardCanvasProps) {
  const [api, setApi] = useState<ExcalidrawAPI | null>(null);

  const lastThemeRef = useRef<WhiteboardTheme>(
    appState.theme === 'dark' ? 'dark' : 'light',
  );

  // theme
  useEffect(() => {
    if (!api || isReadOnly) return;

    const unsubscribe = api.onChange((_nextElements, nextAppState) => {
      const theme = nextAppState.theme;

      if (theme !== 'light' && theme !== 'dark') return;
      if (theme === lastThemeRef.current) return;

      lastThemeRef.current = theme;
      onThemeChange(theme);
    });

    return unsubscribe;
  }, [api, isReadOnly, onThemeChange]);

  return (
    <CanvasErrorBoundary>
      <div className="relative h-full min-h-0 w-full overflow-hidden rounded-xl bg-background">
        <Excalidraw
          excalidrawAPI={setApi}
          initialData={{
            elements: [...elements],
            appState: {
              ...appState,
              theme: appState.theme === 'dark' ? 'dark' : 'light',
              viewModeEnabled: isReadOnly,
            },
          }}
          viewModeEnabled={isReadOnly}
          onChange={(nextElements, nextAppState) => {
            if (isReadOnly) return;

            onChange(nextElements, nextAppState);
          }}
        />
      </div>
    </CanvasErrorBoundary>
  );
}
