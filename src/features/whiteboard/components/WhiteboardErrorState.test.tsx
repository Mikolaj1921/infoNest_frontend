// error state - ai tests (whiteboard)

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhiteboardErrorState from './WhiteboardErrorState';

describe('WhiteboardErrorState', () => {
  test('1. Відображає повідомлення за замовчуванням', () => {
    render(<WhiteboardErrorState />);

    expect(
      screen.getByText('Something went wrong while loading the whiteboard.'),
    ).toBeTruthy();
  });

  test('2. Відображає передане повідомлення про помилку', () => {
    render(<WhiteboardErrorState message="Unable to load the whiteboard." />);

    expect(screen.getByText('Unable to load the whiteboard.')).toBeTruthy();
  });

  test('3. Не відображає кнопку повторної спроби без onRetry', () => {
    render(<WhiteboardErrorState message="Loading failed" />);

    expect(screen.queryByRole('button', { name: /Try again/i })).toBeNull();
  });

  test('4. Відображає кнопку повторної спроби, якщо передано onRetry', () => {
    render(<WhiteboardErrorState onRetry={vi.fn()} />);

    expect(screen.getByRole('button', { name: /Try again/i })).toBeTruthy();
  });

  test('5. Викликає onRetry після натискання кнопки', () => {
    const onRetry = vi.fn();

    render(<WhiteboardErrorState onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
