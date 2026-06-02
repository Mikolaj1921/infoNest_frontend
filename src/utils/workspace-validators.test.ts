// ua: тести для утилітних функцій-валідаторів воркспейсів (аі тести)

import { describe, test, expect } from 'vitest';
import {
  isValidWorkspacesResponse,
  isValidSingleWorkspaceResponse,
} from './workspace-validators';
import { WorkspaceVisibility } from '@/types/workspace';

describe('Validators: Workspace Runtime Guards', () => {
  describe('1. isValidWorkspacesResponse', () => {
    test("Має повертати true, якщо бекенд прислав правильний об'єкт з масивом воркспейсів", () => {
      const validResponse = {
        success: true,
        data: [
          {
            id: 'ws_1',
            name: 'Production Workspace',
            ownerId: 'usr_1',
            visibility: WorkspaceVisibility.PRIVATE,
            createdAt: '2026-06-02T00:00:00.000Z',
            updatedAt: '2026-06-02T00:00:00.000Z',
          },
        ],
      };

      const result = isValidWorkspacesResponse(validResponse);
      expect(result).toBe(true);
    });

    test('Має повертати false, якщо сервер замість масиву надіслав рядок, null або поламану структуру', () => {
      // ua: перевірка різних типів некоректних відповідей рантайму
      const stringData = { success: true, data: 'not-an-array' };
      const nullData = { success: true, data: null };
      const emptyObj = {};
      const statusFalse = { success: false, data: [] };

      expect(isValidWorkspacesResponse(stringData)).toBe(false);
      expect(isValidWorkspacesResponse(nullData)).toBe(false);
      expect(isValidWorkspacesResponse(emptyObj)).toBe(false);
      expect(isValidWorkspacesResponse(statusFalse)).toBe(false);
    });
  });

  describe('2. isValidSingleWorkspaceResponse', () => {
    test('Має повертати true, якщо бекенд прислав валідну обгортку для одного воркспейсу', () => {
      // ua: імітація структури відповіді при створенні/оновленні воркспейсу
      const validSingleResponse = {
        success: true,
        data: {
          workspace: {
            id: 'ws_2',
            name: 'Personal Brain',
            ownerId: 'usr_1',
            visibility: WorkspaceVisibility.PUBLIC,
            createdAt: '2026-06-02T00:00:00.000Z',
            updatedAt: '2026-06-02T00:00:00.000Z',
          },
        },
      };

      const result = isValidSingleWorkspaceResponse(validSingleResponse);
      expect(result).toBe(true);
    });

    test("Має повертати false, якщо у об'єкті відповіді відсутнє поле workspace", () => {
      const invalidSingle = {
        success: true,
        data: {}, // ua: порожнє поле data без об'єкта воркспейсу всередині
      };

      const result = isValidSingleWorkspaceResponse(invalidSingle);
      expect(result).toBe(false);
    });
  });
});
