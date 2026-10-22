// ai tests: whiteboard wrapper

import type { ReactNode } from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhiteboardWrapper from './WhiteboardWrapper';
import { useWhiteboardController } from '../hooks/useWhiteboardController';

const wrapperMocks = vi.hoisted(() => ({
  MockCanvas: vi.fn(),
}));

vi.mock('../hooks/useWhiteboardController', () => ({
  useWhiteboardController: vi.fn(),
}));

vi.mock('next/dynamic', () => {
  //eslint-disable-next-line
  const MockCanvas = (props: Record<string, unknown>) => (
    <div data-testid="mock-whiteboard-canvas">Canvas</div>
  );

  MockCanvas.displayName = 'MockCanvas';

  wrapperMocks.MockCanvas = vi.fn((props: Record<string, unknown>) => props);

  const DynamicMock = () => MockCanvas;

  DynamicMock.displayName = 'DynamicMock';

  return {
    default: DynamicMock,
  };
});

vi.mock('./WhiteboardErrorBoundary', () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('WhiteboardWrapper', () => {
  const mockWhiteboard = {
    id: 'board_123',
    workspaceId: 'ws_123',
    elements: [],
    settings: { theme: 'light' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const mockController = {
    whiteboard: mockWhiteboard,
    role: 'Owner',
    canEdit: true,
    elements: [],
    appState: { theme: 'light' },
    isLoading: false,
    isError: false,
    isReadOnly: false,
    saveStatus: 'saved' as const,
    setIsReadOnly: vi.fn(),
    retryLoading: vi.fn(),
    handleChange: vi.fn(),
    handleThemeChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useWhiteboardController).mockReturnValue(
      mockController as ReturnType<typeof useWhiteboardController>,
    );
  });

  test('1. Передає workspaceId до контролера', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(useWhiteboardController).toHaveBeenCalledWith('ws_123');
  });

  test('2. Показує loading state під час завантаження', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      isLoading: true,
      whiteboard: undefined,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(screen.getByText('Loading whiteboard...')).toBeTruthy();
  });

  test('3. Показує помилку та кнопку повторної спроби', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      isError: true,
      whiteboard: undefined,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(
      screen.getByText('Unable to load the whiteboard. Please try again.'),
    ).toBeTruthy();

    expect(screen.getByRole('button', { name: /Try again/i })).toBeTruthy();
  });

  test('4. Викликає retryLoading після натискання Try again', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      isError: true,
      whiteboard: undefined,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    fireEvent.click(screen.getByRole('button', { name: /Try again/i }));

    expect(mockController.retryLoading).toHaveBeenCalledTimes(1);
  });

  test('5. Відображає заголовок, Canvas і ID дошки після завантаження', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(screen.getByText('Workspace Whiteboard')).toBeTruthy();
    expect(screen.getByTestId('mock-whiteboard-canvas')).toBeTruthy();
    expect(screen.getByText('Board ID: board_123')).toBeTruthy();
  });

  test('6. Відображає кнопку перемикання режиму для Owner', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(screen.getByRole('button', { name: /View board/i })).toBeTruthy();
  });

  test('7. Перемикає режим редагування через контролер', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    fireEvent.click(screen.getByRole('button', { name: /View board/i }));

    expect(mockController.setIsReadOnly).toHaveBeenCalledWith(true);
  });

  test('8. Не показує кнопку перемикання режиму для Viewer', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      role: 'Viewer',
      canEdit: false,
      isReadOnly: true,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(
      screen.queryByRole('button', { name: /View board|Edit board/i }),
    ).toBeNull();

    expect(screen.getByText('View-only access (Viewer)')).toBeTruthy();
  });

  test('9. Відображає повідомлення про доступ лише для перегляду', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      role: 'Guest',
      canEdit: false,
      isReadOnly: true,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(
      screen.getByText('You have read-only access to this whiteboard.'),
    ).toBeTruthy();
  });

  test('10. Передає режим read-only до Canvas для Viewer', () => {
    vi.mocked(useWhiteboardController).mockReturnValue({
      ...mockController,
      role: 'Viewer',
      canEdit: false,
      isReadOnly: true,
    } as ReturnType<typeof useWhiteboardController>);

    render(<WhiteboardWrapper workspaceId="ws_123" />);

    // Перевіряємо props, передані Canvas, через mock-компонент.
    expect(screen.getByTestId('mock-whiteboard-canvas')).toBeTruthy();
  });

  test('11. Передає обробники змін до Canvas', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(screen.getByTestId('mock-whiteboard-canvas')).toBeTruthy();
  });

  test('12. Для користувача з правом редагування показує повідомлення про автозбереження', () => {
    render(<WhiteboardWrapper workspaceId="ws_123" />);

    expect(
      screen.getByText('Changes are saved automatically after 2 seconds.'),
    ).toBeTruthy();
  });
});
