// ai tests - task service

import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { taskService } from './task.service';
import type { TaskCategory, BoardTask } from '@/types/kanban';

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// ua: тестові об'єкти категорії та задачі Kanban
const mockCategory = {
  id: 'column-1',
  name: 'To Do',
  position: 0,
  workspaceId: 'workspace-1',
} as unknown as TaskCategory;

const mockTask = {
  id: 'task-1',
  title: 'Test task',
  description: 'Task description',
  columnId: 'column-1',
  workspaceId: 'workspace-1',
  priority: 'HIGH',
  position: 0,
} as unknown as BoardTask;

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // getWorkspaceKanban
  // ==========================================

  describe('getWorkspaceKanban', () => {
    it('повинен повертати колонки воркспейсу', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            categories: [mockCategory],
          },
        },
      } as never);

      const result = await taskService.getWorkspaceKanban('workspace-1');

      expect(api.get).toHaveBeenCalledWith(
        '/task-categories/workspace/workspace-1',
      );
      expect(result).toEqual([mockCategory]);
    });

    it('повинен повертати порожній масив, якщо success === false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          success: false,
          data: {
            categories: [mockCategory],
          },
        },
      } as never);

      const result = await taskService.getWorkspaceKanban('workspace-1');

      expect(result).toEqual([]);
    });

    it('повинен повертати порожній масив, якщо success відсутній', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {},
      } as never);

      const result = await taskService.getWorkspaceKanban('workspace-1');

      expect(result).toEqual([]);
    });

    it('повинен передавати помилку при невдалому запиті', async () => {
      const error = new Error('Network error');

      vi.mocked(api.get).mockRejectedValueOnce(error);

      await expect(taskService.getWorkspaceKanban('workspace-1')).rejects.toBe(
        error,
      );
    });
  });

  // ==========================================
  // createColumn
  // ==========================================

  describe('createColumn', () => {
    it('повинен створювати колонку та повертати її', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          data: {
            category: mockCategory,
          },
        },
      } as never);

      const result = await taskService.createColumn('workspace-1', 'To Do');

      expect(api.post).toHaveBeenCalledWith('/task-categories', {
        name: 'To Do',
        workspaceId: 'workspace-1',
      });

      expect(result).toEqual(mockCategory);
    });

    it('повинен передавати помилку при невдалому створенні колонки', async () => {
      const error = new Error('Creation failed');

      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        taskService.createColumn('workspace-1', 'To Do'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // reorderCategories
  // ==========================================

  describe('reorderCategories', () => {
    it('повинен оновлювати порядок колонок', async () => {
      const categories = [
        { id: 'column-2', position: 0 },
        { id: 'column-1', position: 1 },
      ];

      vi.mocked(api.patch).mockResolvedValueOnce({} as never);

      await taskService.reorderCategories('workspace-1', categories);

      expect(api.patch).toHaveBeenCalledWith('/task-categories/reorder', {
        workspaceId: 'workspace-1',
        categories,
      });
    });

    it('повинен передавати помилку при невдалому оновленні порядку', async () => {
      const error = new Error('Reorder failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        taskService.reorderCategories('workspace-1', []),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // createTask
  // ==========================================

  describe('createTask', () => {
    it('повинен створювати задачу та повертати її', async () => {
      const payload = {
        title: 'Test task',
        description: 'Task description',
        columnId: 'column-1',
        workspaceId: 'workspace-1',
        priority: 'HIGH' as const,
        dueDate: '2026-12-01',
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          data: {
            task: mockTask,
          },
        },
      } as never);

      const result = await taskService.createTask(payload);

      expect(api.post).toHaveBeenCalledWith('/board-tasks', payload);
      expect(result).toEqual(mockTask);
    });

    it('повинен дозволяти створення задачі без необов’язкових полів', async () => {
      const payload = {
        title: 'Simple task',
        columnId: 'column-1',
        workspaceId: 'workspace-1',
        priority: 'MEDIUM' as const,
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          data: {
            task: mockTask,
          },
        },
      } as never);

      const result = await taskService.createTask(payload);

      expect(api.post).toHaveBeenCalledWith('/board-tasks', payload);
      expect(result).toEqual(mockTask);
    });

    it('повинен передавати помилку при невдалому створенні задачі', async () => {
      const error = new Error('Task creation failed');

      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        taskService.createTask({
          title: 'Test task',
          columnId: 'column-1',
          workspaceId: 'workspace-1',
          priority: 'LOW',
        }),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // updateTask
  // ==========================================

  describe('updateTask', () => {
    it('повинен оновлювати задачу та повертати її', async () => {
      const payload = {
        title: 'Updated task',
        description: 'Updated description',
        priority: 'MEDIUM' as const,
        dueDate: '2026-12-15',
      };

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          data: {
            task: mockTask,
          },
        },
      } as never);

      const result = await taskService.updateTask(
        'task-1',
        'workspace-1',
        payload,
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/board-tasks/task-1?workspaceId=workspace-1',
        payload,
      );

      expect(result).toEqual(mockTask);
    });

    it('повинен передавати помилку при невдалому оновленні задачі', async () => {
      const error = new Error('Update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        taskService.updateTask('task-1', 'workspace-1', {
          title: 'Updated task',
          description: '',
          priority: 'LOW',
        }),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // reorderTasks
  // ==========================================

  describe('reorderTasks', () => {
    it('повинен оновлювати порядок задач', async () => {
      const tasks = [
        {
          id: 'task-2',
          position: 0,
          columnId: 'column-1',
        },
        {
          id: 'task-1',
          position: 1,
          columnId: 'column-2',
        },
      ];

      vi.mocked(api.patch).mockResolvedValueOnce({} as never);

      await taskService.reorderTasks('workspace-1', tasks);

      expect(api.patch).toHaveBeenCalledWith('/board-tasks/reorder', {
        workspaceId: 'workspace-1',
        tasks,
      });
    });

    it('повинен передавати помилку при невдалому оновленні порядку задач', async () => {
      const error = new Error('Task reorder failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(taskService.reorderTasks('workspace-1', [])).rejects.toBe(
        error,
      );
    });
  });

  // ==========================================
  // deleteTask
  // ==========================================

  describe('deleteTask', () => {
    it('повинен видаляти задачу з урахуванням workspaceId', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({} as never);

      await taskService.deleteTask('task-1', 'workspace-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/board-tasks/task-1?workspaceId=workspace-1',
      );
    });

    it('повинен передавати помилку при невдалому видаленні задачі', async () => {
      const error = new Error('Delete failed');

      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await expect(
        taskService.deleteTask('task-1', 'workspace-1'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // deleteColumn
  // ==========================================

  describe('deleteColumn', () => {
    it('повинен видаляти колонку з урахуванням workspaceId', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({} as never);

      await taskService.deleteColumn('column-1', 'workspace-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/task-categories/column-1?workspaceId=workspace-1',
      );
    });

    it('повинен передавати помилку при невдалому видаленні колонки', async () => {
      const error = new Error('Column deletion failed');

      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await expect(
        taskService.deleteColumn('column-1', 'workspace-1'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // updateColumn
  // ==========================================

  describe('updateColumn', () => {
    it('повинен оновлювати назву колонки та повертати її', async () => {
      const updatedCategory = {
        ...mockCategory,
        name: 'In Progress',
      } as TaskCategory;

      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          data: {
            category: updatedCategory,
          },
        },
      } as never);

      const result = await taskService.updateColumn(
        'column-1',
        'workspace-1',
        'In Progress',
      );

      expect(api.patch).toHaveBeenCalledWith(
        '/task-categories/column-1?workspaceId=workspace-1',
        {
          name: 'In Progress',
        },
      );

      expect(result).toEqual(updatedCategory);
    });

    it('повинен передавати помилку при невдалому оновленні колонки', async () => {
      const error = new Error('Column update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(error);

      await expect(
        taskService.updateColumn('column-1', 'workspace-1', 'In Progress'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // linkDocument
  // ==========================================

  describe('linkDocument', () => {
    it('повинен прив’язувати документ до задачі', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          data: {
            task: mockTask,
          },
        },
      } as never);

      const result = await taskService.linkDocument(
        'task-1',
        'workspace-1',
        'document-1',
      );

      expect(api.post).toHaveBeenCalledWith(
        '/board-tasks/task-1/attachments?workspaceId=workspace-1',
        {
          documentId: 'document-1',
        },
      );

      expect(result).toEqual(mockTask);
    });

    it('повинен кодувати workspaceId у URL', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          data: {
            task: mockTask,
          },
        },
      } as never);

      await taskService.linkDocument(
        'task-1',
        'workspace id&test',
        'document-1',
      );

      expect(api.post).toHaveBeenCalledWith(
        '/board-tasks/task-1/attachments?workspaceId=workspace%20id%26test',
        {
          documentId: 'document-1',
        },
      );
    });

    it('повинен передавати помилку при невдалому прив’язуванні документа', async () => {
      const error = new Error('Link document failed');

      vi.mocked(api.post).mockRejectedValueOnce(error);

      await expect(
        taskService.linkDocument('task-1', 'workspace-1', 'document-1'),
      ).rejects.toBe(error);
    });
  });

  // ==========================================
  // unlinkDocument
  // ==========================================

  describe('unlinkDocument', () => {
    it('повинен відв’язувати документ від задачі', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({} as never);

      await taskService.unlinkDocument('task-1', 'workspace-1', 'document-1');

      expect(api.delete).toHaveBeenCalledWith(
        '/board-tasks/task-1/attachments/document-1?workspaceId=workspace-1',
      );
    });

    it('повинен кодувати workspaceId у URL', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({} as never);

      await taskService.unlinkDocument(
        'task-1',
        'workspace id&test',
        'document-1',
      );

      expect(api.delete).toHaveBeenCalledWith(
        '/board-tasks/task-1/attachments/document-1?workspaceId=workspace%20id%26test',
      );
    });

    it('повинен передавати помилку при невдалому відв’язуванні документа', async () => {
      const error = new Error('Unlink document failed');

      vi.mocked(api.delete).mockRejectedValueOnce(error);

      await expect(
        taskService.unlinkDocument('task-1', 'workspace-1', 'document-1'),
      ).rejects.toBe(error);
    });
  });
});
