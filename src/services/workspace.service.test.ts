// ai tests - workspace service

import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { workspaceService } from './workspace.service';

import {
  isValidSingleWorkspaceResponse,
  isValidWorkspacesResponse,
} from '@/validators/workspace-validators';

import type {
  CreateWorkspaceDTO,
  UpdateWorkspaceDTO,
} from './workspace.service';

import { WorkspaceVisibility, type Workspace } from '@/types/workspace';

// ua: мок HTTP-клієнта
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// ua: мок runtime-валідаторів для ізольованого тестування сервісу
vi.mock('@/utils/workspace-validators', () => ({
  isValidSingleWorkspaceResponse: vi.fn(),
  isValidWorkspacesResponse: vi.fn(),
}));

// ua: тестовий об'єкт воркспейсу
const mockWorkspace = {
  id: 'workspace-1',
  name: 'Test Workspace',
  visibility: 'PRIVATE',
  createdAt: '2026-01-01T10:00:00.000Z',
  updatedAt: '2026-01-01T10:00:00.000Z',
} as unknown as Workspace;

describe('workspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ua: за замовчуванням валідатори відхиляють відповідь
    vi.mocked(isValidWorkspacesResponse).mockReturnValue(false);
    vi.mocked(isValidSingleWorkspaceResponse).mockReturnValue(false);
  });

  // ==========================================
  // getAllWorkspaces
  // ==========================================

  describe('getAllWorkspaces', () => {
    it('повинен повертати список воркспейсів при валідній відповіді', async () => {
      const response = {
        success: true,
        data: [mockWorkspace],
      };

      vi.mocked(api.get).mockResolvedValueOnce({
        data: response,
      } as never);

      vi.mocked(isValidWorkspacesResponse).mockReturnValueOnce(true);

      const result = await workspaceService.getAllWorkspaces();

      expect(api.get).toHaveBeenCalledWith('/workspaces');
      expect(isValidWorkspacesResponse).toHaveBeenCalledWith(response);
      expect(result).toEqual([mockWorkspace]);
    });

    it('повинен повертати вкладений масив data.workspaces, якщо стандартна структура невалідна', async () => {
      const workspaces = [mockWorkspace];

      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            workspaces,
          },
        },
      } as never);

      const result = await workspaceService.getAllWorkspaces();

      expect(result).toEqual(workspaces);
      expect(isValidWorkspacesResponse).toHaveBeenCalled();
    });

    it('повинен повертати порожній масив, якщо вкладений workspaces не є масивом', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            workspaces: 'invalid data',
          },
        },
      } as never);

      const result = await workspaceService.getAllWorkspaces();

      expect(result).toEqual([]);
    });

    it('повинен повертати порожній масив, якщо data відсутня', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
        },
      } as never);

      const result = await workspaceService.getAllWorkspaces();

      expect(result).toEqual([]);
    });

    it('повинен повертати порожній масив при некоректній структурі відповіді', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: 'unexpected response',
        },
      } as never);

      const result = await workspaceService.getAllWorkspaces();

      expect(result).toEqual([]);
    });

    it('повинен передавати помилку при невдалому HTTP-запиті', async () => {
      const error = new Error('Failed to fetch workspaces');

      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(workspaceService.getAllWorkspaces()).rejects.toBe(error);
    });
  });

  // ==========================================
  // createWorkspace
  // ==========================================

  describe('createWorkspace', () => {
    it('повинен створювати воркспейс та повертати його', async () => {
      const dto: CreateWorkspaceDTO = {
        name: 'New Workspace',
        visibility: WorkspaceVisibility.PRIVATE,
      };

      const response = {
        success: true,
        data: {
          workspace: mockWorkspace,
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: response,
      } as never);

      vi.mocked(isValidSingleWorkspaceResponse).mockReturnValueOnce(true);

      const result = await workspaceService.createWorkspace(dto);

      expect(api.post).toHaveBeenCalledWith('/workspaces', dto);
      expect(isValidSingleWorkspaceResponse).toHaveBeenCalledWith(response);
      expect(result).toEqual(mockWorkspace);
    });

    it('повинен викидати помилку при невалідній структурі відповіді', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      } as never);

      vi.mocked(isValidSingleWorkspaceResponse).mockReturnValueOnce(false);

      await expect(
        workspaceService.createWorkspace({
          name: 'New Workspace',
          visibility: WorkspaceVisibility.PRIVATE,
        }),
      ).rejects.toThrow(
        'Invalid response structure from server during workspace creation',
      );
    });

    it('повинен передавати помилку при невдалому HTTP-запиті', async () => {
      const error = new Error('Workspace creation failed');

      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        workspaceService.createWorkspace({
          name: 'New Workspace',
          visibility: WorkspaceVisibility.PRIVATE,
        }),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // updateWorkspace
  // ==========================================

  describe('updateWorkspace', () => {
    it('повинен оновлювати воркспейс та повертати його', async () => {
      const dto: UpdateWorkspaceDTO = {
        name: 'Updated Workspace',
        visibility: WorkspaceVisibility.PUBLIC,
      };

      const updatedWorkspace = {
        ...mockWorkspace,
        name: 'Updated Workspace',
        visibility: WorkspaceVisibility.PUBLIC,
      };

      const response = {
        success: true,
        data: {
          workspace: updatedWorkspace,
        },
      };

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: response,
      } as never);

      vi.mocked(isValidSingleWorkspaceResponse).mockReturnValueOnce(true);

      const result = await workspaceService.updateWorkspace('workspace-1', dto);

      expect(api.patch).toHaveBeenCalledWith('/workspaces/workspace-1', dto);

      expect(isValidSingleWorkspaceResponse).toHaveBeenCalledWith(response);
      expect(result).toEqual(updatedWorkspace);
    });

    it('повинен дозволяти часткове оновлення воркспейсу', async () => {
      const dto: UpdateWorkspaceDTO = {
        name: 'Renamed Workspace',
      };

      const updatedWorkspace = {
        ...mockWorkspace,
        name: 'Renamed Workspace',
      };

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            workspace: updatedWorkspace,
          },
        },
      } as never);

      vi.mocked(isValidSingleWorkspaceResponse).mockReturnValueOnce(true);

      const result = await workspaceService.updateWorkspace('workspace-1', dto);

      expect(api.patch).toHaveBeenCalledWith('/workspaces/workspace-1', dto);

      expect(result).toEqual(updatedWorkspace);
    });

    it('повинен викидати помилку при невалідній структурі відповіді', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {},
        },
      } as never);

      vi.mocked(isValidSingleWorkspaceResponse).mockReturnValueOnce(false);

      await expect(
        workspaceService.updateWorkspace('workspace-1', {
          name: 'Updated Workspace',
        }),
      ).rejects.toThrow(
        'Invalid response structure from server during workspace update',
      );
    });

    it('повинен передавати помилку при невдалому HTTP-запиті', async () => {
      const error = new Error('Workspace update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        workspaceService.updateWorkspace('workspace-1', {
          name: 'Updated Workspace',
        }),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // deleteWorkspace
  // ==========================================

  describe('deleteWorkspace', () => {
    it('повинен видаляти воркспейс за його ID', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({} as never);

      await workspaceService.deleteWorkspace('workspace-1');

      expect(api.delete).toHaveBeenCalledWith('/workspaces/workspace-1');
    });

    it('повинен передавати помилку при невдалому видаленні воркспейсу', async () => {
      const error = new Error('Workspace deletion failed');

      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await expect(
        workspaceService.deleteWorkspace('workspace-1'),
      ).rejects.toBe(error);
    });
  });
});
