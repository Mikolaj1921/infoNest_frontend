// loading state comp - ai tests

import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WhiteboardLoadingState from './WhiteboardLoadingState';

describe('WhiteboardLoadingState', () => {
  test('1. Відображає повідомлення за замовчуванням', () => {
    render(<WhiteboardLoadingState />);

    expect(screen.getByText('Loading whiteboard...')).toBeTruthy();
  });

  test('2. Відображає передане повідомлення', () => {
    render(<WhiteboardLoadingState message="Loading whiteboard canvas..." />);

    expect(screen.getByText('Loading whiteboard canvas...')).toBeTruthy();
  });

  test('3. Не відображає повідомлення за замовчуванням, якщо передано інше', () => {
    render(<WhiteboardLoadingState message="Please wait..." />);

    expect(screen.queryByText('Loading whiteboard...')).toBeNull();
    expect(screen.getByText('Please wait...')).toBeTruthy();
  });
});
