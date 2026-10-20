'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faExclamationTriangle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';

import type { WhiteboardElements } from './WhiteboardCanvas';

interface WhiteboardWrapperProps {
  elements: WhiteboardElements;
  onChange: (elements: WhiteboardElements) => void;
  isReadOnly?: boolean;
  isLoading?: boolean;
  error?: string | null;
}

function CanvasLoadingState() {
  return (
    <div
      role="status"
      className="flex min-h-[500px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/40 bg-secondary/10"
    >
      <FontAwesomeIcon
        icon={faSpinner}
        className="h-6 w-6 animate-spin text-primary"
      />

      <span className="text-xs font-bold tracking-wide text-muted-foreground/80">
        Loading whiteboard...
      </span>
    </div>
  );
}

function CanvasErrorState({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex min-h-[500px] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-destructive/20 bg-background p-6 text-center"
    >
      <FontAwesomeIcon
        icon={faExclamationTriangle}
        className="h-6 w-6 text-destructive"
      />

      <p className="text-sm font-semibold text-destructive">
        Failed to load the board
      </p>

      <p className="max-w-md text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

const DynamicCanvas = dynamic(() => import('./WhiteboardCanvas'), {
  ssr: false,
  loading: () => <CanvasLoadingState />,
});

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class WrapperErrorBoundary extends Component<
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
    console.error('Whiteboard wrapper error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <CanvasErrorState message="An error occurred while loading the canvas. Try reloading the page." />
      );
    }

    return this.props.children;
  }
}

export function WhiteboardWrapper({
  elements,
  onChange,
  isReadOnly = false,
  isLoading = false,
  error = null,
}: WhiteboardWrapperProps) {
  if (isLoading) {
    return <CanvasLoadingState />;
  }

  if (error) {
    return <CanvasErrorState message={error} />;
  }

  return (
    <WrapperErrorBoundary>
      <DynamicCanvas
        elements={elements}
        onChange={onChange}
        isReadOnly={isReadOnly}
      />
    </WrapperErrorBoundary>
  );
}
