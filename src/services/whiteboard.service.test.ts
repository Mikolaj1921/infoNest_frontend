// whiteboard service - tests ai

import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { whiteboardService } from './whiteboard.service';
import type { Whiteboard } from '@/types/whiteboard';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockWhiteboard = {
  id: 'board_123',
  workspaceId: 'ws_123',
  elements: [],
  settings: { theme: 'dark' },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
} as unknown as Whiteboard;

describe('whiteboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('1. Отримує дошку та роль користувача', async () => {
    const response = {
      success: true,
      data: {
        whiteboard: mockWhiteboard,
        role: 'Editor',
      },
    };

    vi.mocked(api.get).mockResolvedValue({ data: response });

    const result = await whiteboardService.getWorkspaceWhiteboard('ws_123');

    expect(api.get).toHaveBeenCalledWith('/whiteboards/workspace/ws_123');
    expect(result).toEqual(response.data);
  });

  test('2. Повертає null, якщо API повідомляє success: false', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: false, data: null },
    });

    const result = await whiteboardService.getWorkspaceWhiteboard('ws_123');

    expect(result).toBeNull();
  });

  test('3. Надсилає PATCH із елементами дошки', async () => {
    const payload = { elements: [] };

    vi.mocked(api.patch).mockResolvedValue({
      data: { success: true, data: { whiteboard: mockWhiteboard } },
    });

    const result = await whiteboardService.updateWhiteboard(
      'board_123',
      'ws_123',
      payload,
    );

    expect(api.patch).toHaveBeenCalledWith(
      '/whiteboards/board_123?workspaceId=ws_123',
      payload,
    );
    expect(result).toEqual(mockWhiteboard);
  });

  test('4. Кодує workspaceId у URL запиту на збереження елементів', async () => {
    vi.mocked(api.patch).mockResolvedValue({
      data: { success: true, data: { whiteboard: mockWhiteboard } },
    });

    await whiteboardService.updateWhiteboard('board_123', 'workspace & team', {
      elements: [],
    });

    expect(api.patch).toHaveBeenCalledWith(
      '/whiteboards/board_123?workspaceId=workspace%20%26%20team',
      { elements: [] },
    );
  });

  test('5. Надсилає PATCH із налаштуваннями дошки', async () => {
    const payload = { settings: { theme: 'dark' as const } };

    vi.mocked(api.patch).mockResolvedValue({
      data: { success: true, data: { whiteboard: mockWhiteboard } },
    });

    const result = await whiteboardService.updateWhiteboardSettings(
      'board_123',
      'ws_123',
      payload,
    );

    expect(api.patch).toHaveBeenCalledWith(
      '/whiteboards/board_123/settings?workspaceId=ws_123',
      payload,
    );
    expect(result).toEqual(mockWhiteboard);
  });

  test('6. Передає помилку GET запиту виклику', async () => {
    const error = new Error('Network error');
    vi.mocked(api.get).mockRejectedValue(error);

    await expect(
      whiteboardService.getWorkspaceWhiteboard('ws_123'),
    ).rejects.toThrow('Network error');
  });

  test('7. Передає помилку PATCH запиту виклику', async () => {
    vi.mocked(api.patch).mockRejectedValue(new Error('Save failed'));

    await expect(
      whiteboardService.updateWhiteboard('board_123', 'ws_123', {
        elements: [],
      }),
    ).rejects.toThrow('Save failed');
  });
});
