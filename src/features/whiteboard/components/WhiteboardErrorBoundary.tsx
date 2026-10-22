// ua: компонент ловить помилки рендерингу Canvas, щоб вони не ламали всю сторінку

'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import WhiteboardErrorState from './WhiteboardErrorState';

interface WhiteboardErrorBoundaryProps {
  children: ReactNode;
}

interface WhiteboardErrorBoundaryState {
  hasError: boolean;
}

export default class WhiteboardErrorBoundary extends Component<
  WhiteboardErrorBoundaryProps,
  WhiteboardErrorBoundaryState
> {
  state: WhiteboardErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): WhiteboardErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Whiteboard canvas error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <WhiteboardErrorState message="The whiteboard could not be displayed. Try reloading the page." />
      );
    }

    return this.props.children;
  }
}
