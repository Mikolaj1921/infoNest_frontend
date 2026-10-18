// ua: тести хука - аі тести

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useWorkspaceKanban, useDeleteTask } from './useKanbanData';
import { taskService } from '@/services/task.service';

// ai tests

vi.mock('@/services/task.service', () => ({
  taskService: {
    getWorkspaceKanban: vi.fn(),
    deleteTask: vi.fn(),
  },
}));

describe('Hooks: useKanbanData Store', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. useWorkspaceKanban має успішно завантажувати структуру дошки з сервісу', async () => {
    const mockCategories = [
      {
        id: 'col-1',
        name: 'To Do',
        workspaceId: 'ws-123',
        position: 0,
        createdAt: '',
        updatedAt: '',
        boardTasks: [],
      },
    ];
    vi.mocked(taskService.getWorkspaceKanban).mockResolvedValueOnce(
      mockCategories,
    );

    const { result } = renderHook(() => useWorkspaceKanban('ws-123'), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategories);
  });

  it('2. useDeleteTask має викликати мутацію видалення завдання з правильним ID', async () => {
    vi.mocked(taskService.deleteTask).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteTask('ws-123'), { wrapper });

    result.current.mutate('task-999');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(taskService.deleteTask).toHaveBeenCalledWith('task-999', 'ws-123');
  });
});
