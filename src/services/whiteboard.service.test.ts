// ai tests - whiteboard service

import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { whiteboardService } from './whiteboard.service';

import type {
  Whiteboard,
  WorkspaceWhiteboardData,
  UpdateWhiteboardPayload,
  UpdateWhiteboardSettingsPayload,
} from '@/types/whiteboard';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

// ua: тестові дані інтерактивної дошки
const mockWhiteboard = {
  id: 'whiteboard-1',
  workspaceId: 'workspace-1',
  elements: [],
  appState: {
    theme: 'light',
  },
} as unknown as Whiteboard;

// ua: тестові дані дошки воркспейсу
const mockWorkspaceWhiteboard = {
  whiteboard: mockWhiteboard,
} as unknown as WorkspaceWhiteboardData;

describe('whiteboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // getWorkspaceWhiteboard
  // ==========================================

  describe('getWorkspaceWhiteboard', () => {
    it('повинен повертати дані дошки воркспейсу', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockWorkspaceWhiteboard,
        },
      } as never);

      const result =
        await whiteboardService.getWorkspaceWhiteboard('workspace-1');

      expect(api.get).toHaveBeenCalledWith(
        '/whiteboards/workspace/workspace-1',
      );

      expect(result).toEqual(mockWorkspaceWhiteboard);
    });

    it('повинен повертати null, якщо success === false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: mockWorkspaceWhiteboard,
        },
      } as never);

      const result =
        await whiteboardService.getWorkspaceWhiteboard('workspace-1');

      expect(result).toBeNull();
    });

    it('повинен повертати null, якщо відповідь не містить success', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {},
      } as never);

      const result =
        await whiteboardService.getWorkspaceWhiteboard('workspace-1');

      expect(result).toBeNull();
    });

    it('повинен повертати null, якщо data відсутня при успішній відповіді', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
        },
      } as never);

      const result =
        await whiteboardService.getWorkspaceWhiteboard('workspace-1');

      expect(result).toBeUndefined();
    });

    it('повинен передавати помилку при невдалому запиті', async () => {
      const error = new Error('Failed to load whiteboard');

      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(
        whiteboardService.getWorkspaceWhiteboard('workspace-1'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // updateWhiteboard
  // ==========================================

  describe('updateWhiteboard', () => {
    it('повинен зберігати елементи дошки та повертати оновлену дошку', async () => {
      const payload = {
        elements: [
          {
            id: 'element-1',
            type: 'rectangle',
            x: 100,
            y: 100,
          },
        ],
      } as unknown as UpdateWhiteboardPayload;

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            whiteboard: mockWhiteboard,
          },
        },
      } as never);

      const result = await whiteboardService.updateWhiteboard(
        'whiteboard-1',
        'workspace-1',
        payload,
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/whiteboards/whiteboard-1?workspaceId=workspace-1',
        payload,
      );

      expect(result).toEqual(mockWhiteboard);
    });

    it('повинен kodować workspaceId у URL', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            whiteboard: mockWhiteboard,
          },
        },
      } as never);

      await whiteboardService.updateWhiteboard(
        'whiteboard-1',
        'workspace id&test',
        {} as UpdateWhiteboardPayload,
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/whiteboards/whiteboard-1?workspaceId=workspace%20id%26test',
        {},
      );
    });

    it('повинен передавати помилку при невдалому збереженні дошки', async () => {
      const error = new Error('Whiteboard update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        whiteboardService.updateWhiteboard(
          'whiteboard-1',
          'workspace-1',
          {} as UpdateWhiteboardPayload,
        ),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // updateWhiteboardSettings
  // ==========================================

  describe('updateWhiteboardSettings', () => {
    it('повинен зберігати налаштування дошки та повертати її', async () => {
      const payload = {
        appState: {
          theme: 'dark',
        },
      } as unknown as UpdateWhiteboardSettingsPayload;

      const updatedWhiteboard = {
        ...mockWhiteboard,
        appState: {
          theme: 'dark',
        },
      } as unknown as Whiteboard;

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            whiteboard: updatedWhiteboard,
          },
        },
      } as never);

      const result = await whiteboardService.updateWhiteboardSettings(
        'whiteboard-1',
        'workspace-1',
        payload,
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/whiteboards/whiteboard-1/settings?workspaceId=workspace-1',
        payload,
      );

      expect(result).toEqual(updatedWhiteboard);
    });

    it('повинен kodować workspaceId у URL', async () => {
      const payload = {
        appState: {
          theme: 'dark',
        },
      } as unknown as UpdateWhiteboardSettingsPayload;

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            whiteboard: mockWhiteboard,
          },
        },
      } as never);

      await whiteboardService.updateWhiteboardSettings(
        'whiteboard-1',
        'workspace id&test',
        payload,
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/whiteboards/whiteboard-1/settings?workspaceId=workspace%20id%26test',
        payload,
      );
    });

    it('повинен передавати помилку при невдалому збереженні налаштувань', async () => {
      const error = new Error('Whiteboard settings update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        whiteboardService.updateWhiteboardSettings(
          'whiteboard-1',
          'workspace-1',
          {} as UpdateWhiteboardSettingsPayload,
        ),
      ).rejects.toBe(error);
    });
  });
});
