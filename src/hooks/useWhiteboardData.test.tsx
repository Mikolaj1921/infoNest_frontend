// ai tests - whiteboard data hook

import type { ReactNode } from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { toast } from 'sonner';
import { whiteboardService } from '@/services/whiteboard.service';
import {
  useWorkspaceWhiteboard,
  useUpdateWhiteboard,
  useUpdateWhiteboardSettings,
} from './useWhiteboardData';
import type { Whiteboard, WorkspaceWhiteboardData } from '@/types/whiteboard';

vi.mock('@/services/whiteboard.service', () => ({
  whiteboardService: {
    getWorkspaceWhiteboard: vi.fn(),
    updateWhiteboard: vi.fn(),
    updateWhiteboardSettings: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

const board = {
  id: 'board_123',
  workspaceId: 'ws_123',
  elements: [],
  settings: { theme: 'light' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
} as unknown as Whiteboard;

const workspaceData: WorkspaceWhiteboardData = {
  whiteboard: board,
  role: 'Owner',
};

describe('useWhiteboardData', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    function TestWrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    }

    TestWrapper.displayName = 'TestWrapper';

    return TestWrapper;
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. Отримує дошку через whiteboardService', async () => {
    vi.mocked(whiteboardService.getWorkspaceWhiteboard).mockResolvedValue(
      workspaceData,
    );

    const { result } = renderHook(() => useWorkspaceWhiteboard('ws_123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(workspaceData);
    });

    expect(whiteboardService.getWorkspaceWhiteboard).toHaveBeenCalledWith(
      'ws_123',
    );
  });

  test('2. Не виконує запит, якщо workspaceId порожній', async () => {
    const { result } = renderHook(() => useWorkspaceWhiteboard(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(whiteboardService.getWorkspaceWhiteboard).not.toHaveBeenCalled();
  });

  test('3. Повертає помилку запиту, якщо сервіс відхиляє Promise', async () => {
    vi.mocked(whiteboardService.getWorkspaceWhiteboard).mockRejectedValue(
      new Error('Request failed'),
    );

    const { result } = renderHook(() => useWorkspaceWhiteboard('ws_123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
  });

  test('4. Зберігає елементи дошки через mutation', async () => {
    const updatedBoard = {
      ...board,
      elements: [{ id: 'element_1' }],
      updatedAt: '2026-01-02T00:00:00.000Z',
    } as unknown as Whiteboard;

    vi.mocked(whiteboardService.updateWhiteboard).mockResolvedValue(
      updatedBoard,
    );

    const wrapper = createWrapper();

    queryClient.setQueryData<WorkspaceWhiteboardData>(
      ['workspace-whiteboard', 'ws_123'],
      workspaceData,
    );

    const { result } = renderHook(() => useUpdateWhiteboard('ws_123'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        whiteboardId: 'board_123',
        elements:
          updatedBoard.elements as Whiteboard['elements'] extends infer T
            ? T & []
            : never,
      });
    });

    expect(whiteboardService.updateWhiteboard).toHaveBeenCalledWith(
      'board_123',
      'ws_123',
      { elements: updatedBoard.elements },
    );

    expect(
      queryClient.getQueryData<WorkspaceWhiteboardData>([
        'workspace-whiteboard',
        'ws_123',
      ])?.whiteboard.elements,
    ).toEqual(updatedBoard.elements);
  });

  test('5. Зберігає налаштування та оновлює кеш', async () => {
    const updatedBoard = {
      ...board,
      settings: { theme: 'dark' },
      updatedAt: '2026-01-02T00:00:00.000Z',
    } as unknown as Whiteboard;

    vi.mocked(whiteboardService.updateWhiteboardSettings).mockResolvedValue(
      updatedBoard,
    );

    const wrapper = createWrapper();

    queryClient.setQueryData<WorkspaceWhiteboardData>(
      ['workspace-whiteboard', 'ws_123'],
      workspaceData,
    );

    const { result } = renderHook(() => useUpdateWhiteboardSettings('ws_123'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        whiteboardId: 'board_123',
        settings: { theme: 'dark' },
      });
    });

    expect(whiteboardService.updateWhiteboardSettings).toHaveBeenCalledWith(
      'board_123',
      'ws_123',
      {
        settings: { theme: 'dark' },
      },
    );

    expect(
      queryClient.getQueryData<WorkspaceWhiteboardData>([
        'workspace-whiteboard',
        'ws_123',
      ])?.whiteboard.settings,
    ).toEqual({ theme: 'dark' });
  });

  test('6. Показує повідомлення про помилку автозбереження елементів', async () => {
    vi.mocked(whiteboardService.updateWhiteboard).mockRejectedValue(
      new Error('Save failed'),
    );

    const { result } = renderHook(() => useUpdateWhiteboard('ws_123'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          whiteboardId: 'board_123',
          elements: [],
        }),
      ).rejects.toThrow('Save failed');
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to autosave whiteboard progress',
    );
  });

  test('7. Показує повідомлення про помилку збереження налаштувань', async () => {
    vi.mocked(whiteboardService.updateWhiteboardSettings).mockRejectedValue(
      new Error('Settings failed'),
    );

    const { result } = renderHook(() => useUpdateWhiteboardSettings('ws_123'), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          whiteboardId: 'board_123',
          settings: { theme: 'dark' },
        }),
      ).rejects.toThrow('Settings failed');
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to save whiteboard settings',
    );
  });

  test('8. Не руйнує кеш, якщо попередніх даних немає', async () => {
    vi.mocked(whiteboardService.updateWhiteboard).mockResolvedValue(board);

    const wrapper = createWrapper();

    const { result } = renderHook(() => useUpdateWhiteboard('ws_123'), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({
        whiteboardId: 'board_123',
        elements: [],
      });
    });

    expect(
      queryClient.getQueryData(['workspace-whiteboard', 'ws_123']),
    ).toBeUndefined();
  });
});
