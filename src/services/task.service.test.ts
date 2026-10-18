// ua: тести сервісу з тасками - канбан

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { taskService } from './task.service';

// ai tests

vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Service: taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. getWorkspaceKanban має викликати правильний URL-пас', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({
      data: { success: true, data: { categories: [] } },
    });

    await taskService.getWorkspaceKanban('ws-123');

    expect(api.get).toHaveBeenCalledWith('/task-categories/workspace/ws-123');
  });

  it('2. createTask має надсилати повний набір метаданих у тілі запиту', async () => {
    const mockPayload = {
      title: 'Fix issue',
      description: 'Detailed description text',
      columnId: 'col-1',
      workspaceId: 'ws-123',
      priority: 'HIGH' as const,
      dueDate: '2026-10-18T00:00:00.000Z',
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: { data: { task: {} } } });

    await taskService.createTask(mockPayload);

    expect(api.post).toHaveBeenCalledWith('/board-tasks', mockPayload);
  });

  it('3. updateTask має передавати workspaceId суворо через query параметри рядка', async () => {
    const mockPayload = {
      title: 'New Title',
      description: '',
      priority: 'LOW' as const,
      dueDate: '',
    };
    vi.mocked(api.patch).mockResolvedValueOnce({
      data: { data: { task: {} } },
    });

    await taskService.updateTask('task-777', 'ws-123', mockPayload);

    expect(api.patch).toHaveBeenCalledWith(
      '/board-tasks/task-777?workspaceId=ws-123',
      mockPayload,
    );
  });

  it('4. deleteTask має надсилати точний DELETE запит із параметром воркспейсу', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: {} });

    await taskService.deleteTask('task-777', 'ws-123');

    expect(api.delete).toHaveBeenCalledWith(
      '/board-tasks/task-777?workspaceId=ws-123',
    );
  });
});
