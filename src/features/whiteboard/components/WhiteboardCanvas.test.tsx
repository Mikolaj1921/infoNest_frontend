// ai tests - canvas tests

import type { ComponentProps } from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhiteboardCanvas from './WhiteboardCanvas';
import type {
  WhiteboardAppState,
  WhiteboardElements,
} from './WhiteboardCanvas';

const excalidrawMocks = vi.hoisted(() => ({
  onChange: vi.fn(),
  apiOnChange: vi.fn(),
  initialData: vi.fn(),
  viewModeEnabled: vi.fn(),
}));

vi.mock('@excalidraw/excalidraw', async () => {
  const React = await import('react');

  return {
    Excalidraw: (props: {
      initialData: {
        elements: unknown[];
        appState: Record<string, unknown>;
      };
      viewModeEnabled: boolean;
      onChange: (...args: unknown[]) => void;
      excalidrawAPI: (api: {
        onChange: (callback: (...args: unknown[]) => void) => () => void;
      }) => void;
    }) => {
      excalidrawMocks.initialData(props.initialData);
      excalidrawMocks.viewModeEnabled(props.viewModeEnabled);
      excalidrawMocks.onChange.mockImplementation(props.onChange);

      React.useEffect(() => {
        props.excalidrawAPI({
          onChange: (callback) => {
            excalidrawMocks.apiOnChange.mockImplementation(callback);

            return () => {
              excalidrawMocks.apiOnChange.mockReset();
            };
          },
        });
        // eslint-disable-next-line
      }, [props.excalidrawAPI]);

      return React.createElement(
        'div',
        { 'data-testid': 'mock-excalidraw' },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              props.onChange([{ id: 'changed-element' }], {
                theme: 'light',
              }),
          },
          'Simulate canvas change',
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              excalidrawMocks.apiOnChange([], {
                theme: 'dark',
              }),
          },
          'Simulate dark theme',
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () =>
              excalidrawMocks.apiOnChange([], {
                theme: 'light',
              }),
          },
          'Simulate light theme',
        ),
      );
    },
  };
});

const elements = [] as unknown as WhiteboardElements;
const appState: WhiteboardAppState = { theme: 'light' };

describe('WhiteboardCanvas', () => {
  const onChange = vi.fn();
  const onThemeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCanvas = (
    props: Partial<ComponentProps<typeof WhiteboardCanvas>> = {},
  ) =>
    render(
      <WhiteboardCanvas
        elements={elements}
        appState={appState}
        onChange={onChange}
        onThemeChange={onThemeChange}
        {...props}
      />,
    );

  test('1. Відображає Excalidraw', () => {
    renderCanvas();

    expect(screen.getByTestId('mock-excalidraw')).toBeTruthy();
  });

  test('2. Передає початкові елементи до Excalidraw', () => {
    renderCanvas();

    expect(excalidrawMocks.initialData).toHaveBeenCalledWith(
      expect.objectContaining({
        elements: [],
      }),
    );
  });

  test('3. Нормалізує початкову тему до light, якщо тема не dark', () => {
    renderCanvas({ appState: {} });

    expect(excalidrawMocks.initialData).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({ theme: 'light' }),
      }),
    );
  });

  test('4. Передає темну тему до Excalidraw', () => {
    renderCanvas({ appState: { theme: 'dark' } });

    expect(excalidrawMocks.initialData).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({ theme: 'dark' }),
      }),
    );
  });

  test('5. Вмикає view mode для read-only дошки', () => {
    renderCanvas({ isReadOnly: true });

    expect(excalidrawMocks.viewModeEnabled).toHaveBeenCalledWith(true);
    expect(excalidrawMocks.initialData).toHaveBeenCalledWith(
      expect.objectContaining({
        appState: expect.objectContaining({ viewModeEnabled: true }),
      }),
    );
  });

  test('6. Вимикає view mode для дошки з правом редагування', () => {
    renderCanvas({ isReadOnly: false });

    expect(excalidrawMocks.viewModeEnabled).toHaveBeenCalledWith(false);
  });

  test('7. Передає зміни полотна у onChange', () => {
    renderCanvas();

    fireEvent.click(
      screen.getByRole('button', { name: 'Simulate canvas change' }),
    );

    expect(onChange).toHaveBeenCalledWith([{ id: 'changed-element' }], {
      theme: 'light',
    });
  });

  test('8. Не передає зміни полотна, якщо ввімкнено read-only', () => {
    renderCanvas({ isReadOnly: true });

    fireEvent.click(
      screen.getByRole('button', { name: 'Simulate canvas change' }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  test('9. Передає зміну теми на dark у onThemeChange', () => {
    renderCanvas();

    fireEvent.click(
      screen.getByRole('button', { name: 'Simulate dark theme' }),
    );

    expect(onThemeChange).toHaveBeenCalledWith('dark');
  });

  test('10. Передає зміну теми на light у onThemeChange', () => {
    renderCanvas({ appState: { theme: 'dark' } });

    fireEvent.click(
      screen.getByRole('button', { name: 'Simulate light theme' }),
    );

    expect(onThemeChange).toHaveBeenCalledWith('light');
  });

  test('11. Не підписується на зміну теми в режимі read-only', () => {
    renderCanvas({ isReadOnly: true });

    expect(excalidrawMocks.apiOnChange).not.toHaveBeenCalled();
  });
});
