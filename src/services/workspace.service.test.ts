// ua: тестування сервісу workspaceService

import { describe, test, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { workspaceService } from './workspace.service';
import { WorkspaceVisibility, Workspace } from '@/types/workspace';

describe('Services: workspaceService (Axios Mocking)', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // ua: очищаємо лічильники викликів перед кожним тестом
  });

  const mockSingleWorkspace: Workspace = {
    id: 'ws_123',
    name: 'Development Space',
    ownerId: 'usr_999',
    visibility: WorkspaceVisibility.PRIVATE,
    createdAt: '2026-06-02T00:00:00.000Z',
    updatedAt: '2026-06-02T00:00:00.000Z',
  };

  //  Тест 1: getAllWorkspaces
  test('1. getAllWorkspaces має успішно повертати масив воркспейсів при валідній структурі', async () => {
    // ua: імітуємо успішну відповідь від Express-контролера
    const mockServerResponse = {
      data: {
        success: true,
        data: [mockSingleWorkspace],
      },
    };

    vi.spyOn(api, 'get').mockResolvedValueOnce(mockServerResponse);

    const result = await workspaceService.getAllWorkspaces();

    expect(api.get).toHaveBeenCalledWith('/workspaces');
    expect(result).toBeInstanceOf(Array);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockSingleWorkspace);
  });

  //  Тест 2: createWorkspace
  test("2. createWorkspace має повертати чистий об'єкт воркспейсу при успішному POST-запиті", async () => {
    const mockServerResponse = {
      data: {
        success: true,
        data: {
          workspace: mockSingleWorkspace,
        },
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockServerResponse);

    const dto = {
      name: 'Development Space',
      visibility: WorkspaceVisibility.PRIVATE,
    };
    const result = await workspaceService.createWorkspace(dto);

    expect(api.post).toHaveBeenCalledWith('/workspaces', dto);
    expect(result).toEqual(mockSingleWorkspace);
  });

  //  Тест 3: createWorkspace (Критичний збій структури)
  test('3. createWorkspace має викидати помилку Error, якщо сервер повернув зламаний JSON без поля workspace', async () => {
    // ua: імітуємо поламану відповідь бекенду (наприклад, пропущено ключ workspace)
    const mockBrokenResponse = {
      data: {
        success: true,
        data: {},
      },
    };

    vi.spyOn(api, 'post').mockResolvedValueOnce(mockBrokenResponse);

    const dto = {
      name: 'Broken Space',
      visibility: WorkspaceVisibility.PRIVATE,
    };

    // ua: очікуємо, що наш захисний механізм викине чітке текстове виключення throw new Error
    await expect(workspaceService.createWorkspace(dto)).rejects.toThrow(
      'Invalid response structure from server during workspace creation',
    );
  });
});
