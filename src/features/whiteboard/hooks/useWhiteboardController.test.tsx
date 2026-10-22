// ai tests - controller hook whiteboard

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhiteboardController } from './useWhiteboardController';
import type {
  Whiteboard,
  WhiteboardRole,
  WorkspaceWhiteboardData,
} from '@/types/whiteboard';
import type {
  WhiteboardAppState,
  WhiteboardElements,
} from '../components/WhiteboardCanvas';

const mocks = vi.hoisted(() => ({
  refetch: vi.fn(),
  updateElements: vi.fn(),
  updateSettings: vi.fn(),
  elementsPending: false,
  settingsPending: false,
  queryData: null as unknown,
  isLoading: false,
  isError: false,
}));

vi.mock('@/hooks/useWhiteboardData', () => ({
  useWorkspaceWhiteboard: () => ({
    data: mocks.queryData,
    isLoading: mocks.isLoading,
    isError: mocks.isError,
    refetch: mocks.refetch,
  }),
  useUpdateWhiteboard: () => ({
    isPending: mocks.elementsPending,
    mutate: mocks.updateElements,
  }),
  useUpdateWhiteboardSettings: () => ({
    isPending: mocks.settingsPending,
    mutate: mocks.updateSettings,
  }),
}));

// ua: у тестах контролюємо debounce без реального очікування
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: unknown) => value,
}));

const initialElements = [
  { id: 'element_1', type: 'rectangle' },
] as unknown as WhiteboardElements;

const board = {
  id: 'board_123',
  workspaceId: 'ws_123',
  elements: initialElements,
  settings: { theme: 'light' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as unknown as Whiteboard;

const createWorkspaceData = (
  role: WhiteboardRole,
): WorkspaceWhiteboardData => ({
  whiteboard: board,
  role,
});

describe('useWhiteboardController', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.queryData = createWorkspaceData('Owner');
    mocks.isLoading = false;
    mocks.isError = false;
    mocks.elementsPending = false;
    mocks.settingsPending = false;
  });

  test('1. Повертає дані дошки та роль користувача', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    expect(result.current.whiteboard).toEqual(board);
    expect(result.current.role).toBe('Owner');
    expect(result.current.canEdit).toBe(true);
    expect(result.current.elements).toEqual(initialElements);
  });

  test.each(['Owner', 'Admin', 'Editor'] as const)(
    '2. Роль %s має право редагувати дошку',
    (role) => {
      mocks.queryData = createWorkspaceData(role);

      const { result } = renderHook(() => useWhiteboardController('ws_123'));

      expect(result.current.canEdit).toBe(true);
      expect(result.current.isReadOnly).toBe(false);
    },
  );

  test.each(['Viewer', 'Guest'] as const)(
    '3. Роль %s має лише доступ для перегляду',
    (role) => {
      mocks.queryData = createWorkspaceData(role);

      const { result } = renderHook(() => useWhiteboardController('ws_123'));

      expect(result.current.canEdit).toBe(false);
      expect(result.current.isReadOnly).toBe(true);
    },
  );

  test('4. Відображає loading та error стани запиту', () => {
    mocks.isLoading = true;

    const { result, rerender } = renderHook(() =>
      useWhiteboardController('ws_123'),
    );

    expect(result.current.isLoading).toBe(true);

    mocks.isLoading = false;
    mocks.isError = true;

    rerender();

    expect(result.current.isError).toBe(true);
  });

  test('5. Викликає повторне завантаження дошки', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.retryLoading();
    });

    expect(mocks.refetch).toHaveBeenCalledTimes(1);
  });

  test('6. Дозволяє ввімкнути read-only для користувача з правом редагування', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.setIsReadOnly(true);
    });

    expect(result.current.isReadOnly).toBe(true);
    expect(result.current.canEdit).toBe(true);
  });

  test('7. Дозволяє повернутися до режиму редагування', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.setIsReadOnly(true);
    });

    act(() => {
      result.current.setIsReadOnly(false);
    });

    expect(result.current.isReadOnly).toBe(false);
  });

  test('8. Не дозволяє Viewer вимкнути read-only', () => {
    mocks.queryData = createWorkspaceData('Viewer');

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.setIsReadOnly(false);
    });

    expect(result.current.isReadOnly).toBe(true);
  });

  test('9. Не змінює чернетку через handleChange для Viewer', () => {
    mocks.queryData = createWorkspaceData('Viewer');

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleChange(
        [{ id: 'changed' }] as unknown as WhiteboardElements,
        { theme: 'dark' },
      );
    });

    expect(result.current.elements).toEqual(initialElements);
    expect(mocks.updateElements).not.toHaveBeenCalled();
  });

  test('10. Оновлює локальні елементи після handleChange', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    const nextElements = [
      { id: 'element_2', type: 'ellipse' },
    ] as unknown as WhiteboardElements;

    act(() => {
      result.current.handleChange(nextElements, {
        theme: 'light',
        gridSize: 20,
      } as WhiteboardAppState);
    });

    expect(result.current.elements).toEqual(nextElements);
  });

  test('11. Зберігає поточну тему під час зміни елементів', () => {
    const darkBoard = {
      ...board,
      settings: { theme: 'dark' },
    } as Whiteboard;

    mocks.queryData = {
      whiteboard: darkBoard,
      role: 'Owner',
    } satisfies WorkspaceWhiteboardData;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleChange(
        [{ id: 'changed' }] as unknown as WhiteboardElements,
        { theme: 'light' },
      );
    });

    expect(result.current.appState.theme).toBe('dark');
  });

  test('12. Оновлює локальну тему через handleThemeChange', () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleThemeChange('dark');
    });

    expect(result.current.appState.theme).toBe('dark');
  });

  test('13. Не дозволяє Viewer змінювати тему', () => {
    mocks.queryData = createWorkspaceData('Viewer');

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleThemeChange('dark');
    });

    expect(result.current.appState.theme).toBe('light');
    expect(mocks.updateSettings).not.toHaveBeenCalled();
  });

  test('14. Передає змінені елементи в мутацію автозбереження', async () => {
    const nextElements = [
      { id: 'element_2', type: 'rectangle' },
    ] as unknown as WhiteboardElements;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleChange(nextElements, { theme: 'light' });
    });

    await waitFor(() => {
      expect(mocks.updateElements).toHaveBeenCalledWith(
        {
          whiteboardId: 'board_123',
          elements: nextElements,
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });
  });

  test('15. Передає змінені налаштування в мутацію збереження', async () => {
    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleThemeChange('dark');
    });

    await waitFor(() => {
      expect(mocks.updateSettings).toHaveBeenCalledWith(
        {
          whiteboardId: 'board_123',
          settings: expect.objectContaining({ theme: 'dark' }),
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        }),
      );
    });
  });

  test('16. Оновлює статус після успішного збереження', async () => {
    const nextElements = [{ id: 'element_2' }] as unknown as WhiteboardElements;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleChange(nextElements, { theme: 'light' });
    });

    await waitFor(() => {
      expect(mocks.updateElements).toHaveBeenCalled();
    });

    const options = mocks.updateElements.mock.calls[0][1] as {
      onSuccess: () => void;
    };

    act(() => {
      options.onSuccess();
    });

    expect(result.current.saveStatus).toBe('saved');
  });

  test('17. Встановлює статус error після помилки збереження', async () => {
    const nextElements = [{ id: 'element_2' }] as unknown as WhiteboardElements;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    act(() => {
      result.current.handleChange(nextElements, { theme: 'light' });
    });

    await waitFor(() => {
      expect(mocks.updateElements).toHaveBeenCalled();
    });

    const options = mocks.updateElements.mock.calls[0][1] as {
      onError: () => void;
    };

    act(() => {
      options.onError();
    });

    expect(result.current.saveStatus).toBe('error');
  });

  test('18. Показує статус saving, поки мутація виконується', () => {
    mocks.elementsPending = true;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    expect(result.current.saveStatus).toBe('saving');
  });

  test('19. Показує статус saving, поки зберігаються налаштування', () => {
    mocks.settingsPending = true;

    const { result } = renderHook(() => useWhiteboardController('ws_123'));

    expect(result.current.saveStatus).toBe('saving');
  });
});
