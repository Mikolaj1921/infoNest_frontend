// ai tests - error boundary

import { type ReactNode } from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhiteboardErrorBoundary from './WhiteboardErrorBoundary';

interface ThrowErrorProps {
  shouldThrow: boolean;
  children?: ReactNode;
}

function ThrowError({ shouldThrow, children }: ThrowErrorProps) {
  if (shouldThrow) {
    throw new Error('Test canvas error');
  }

  return <div>{children ?? 'Canvas rendered successfully'}</div>;
}

describe('WhiteboardErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('1. Відображає дочірній компонент, якщо помилки немає', () => {
    render(
      <WhiteboardErrorBoundary>
        <ThrowError shouldThrow={false} />
      </WhiteboardErrorBoundary>,
    );

    expect(screen.getByText('Canvas rendered successfully')).toBeTruthy();
  });

  test('2. Показує fallback, якщо дочірній компонент кидає помилку', () => {
    render(
      <WhiteboardErrorBoundary>
        <ThrowError shouldThrow />
      </WhiteboardErrorBoundary>,
    );

    expect(
      screen.getByText(
        'The whiteboard could not be displayed. Try reloading the page.',
      ),
    ).toBeTruthy();
  });

  test('3. Не відображає дочірній компонент після помилки', () => {
    render(
      <WhiteboardErrorBoundary>
        <ThrowError shouldThrow />
      </WhiteboardErrorBoundary>,
    );

    expect(screen.queryByText('Canvas rendered successfully')).toBeNull();
  });
});
