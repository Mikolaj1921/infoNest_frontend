// ai tests

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useWorkspaceKanban,
  useCreateColumn,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useDeleteColumn,
  useUpdateColumn,
  useReorderTasks,
  useReorderCategories,
  useLinkDocument,
  useUnlinkDocument,
} from './useKanbanData';

import { taskService } from '@/services/task.service';
import { toast } from 'sonner';
import type { TaskCategory } from '@/types/kanban';

// ua: мок сервісу Kanban
vi.mock('@/services/task.service', () => ({
  taskService: {
    getWorkspaceKanban: vi.fn(),
    createColumn: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    deleteColumn: vi.fn(),
    updateColumn: vi.fn(),
    reorderTasks: vi.fn(),
    reorderCategories: vi.fn(),
    linkDocument: vi.fn(),
    unlinkDocument: vi.fn(),
  },
}));

// ua: мок toast-повідомлень
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Hooks: useKanbanData', () => {
  let queryClient: QueryClient;

  const workspaceId = 'ws-123';
  const queryKey = ['workspace-kanban', workspaceId];

  const mockCategories: TaskCategory[] = [
    {
      id: 'col-1',
      name: 'To Do',
      workspaceId,
      position: 0,
      createdAt: '',
      updatedAt: '',
      boardTasks: [],
    },
  ];

  // ua: створення ізольованого QueryClient для кожного тесту
  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    return function TestQueryClientWrapper({
      children,
    }: {
      children: React.ReactNode;
    }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(taskService.getWorkspaceKanban).mockResolvedValue([]);
    vi.mocked(taskService.createColumn).mockResolvedValue({} as never);
    vi.mocked(taskService.createTask).mockResolvedValue({} as never);
    vi.mocked(taskService.updateTask).mockResolvedValue({} as never);
    vi.mocked(taskService.deleteTask).mockResolvedValue(undefined);
    vi.mocked(taskService.deleteColumn).mockResolvedValue(undefined);
    vi.mocked(taskService.updateColumn).mockResolvedValue({} as never);
    vi.mocked(taskService.reorderTasks).mockResolvedValue(undefined);
    vi.mocked(taskService.reorderCategories).mockResolvedValue(undefined);
    vi.mocked(taskService.linkDocument).mockResolvedValue({} as never);
    vi.mocked(taskService.unlinkDocument).mockResolvedValue({} as never);
  });

  // --------------------------------------------------
  // useWorkspaceKanban
  // --------------------------------------------------

  it('1. useWorkspaceKanban має завантажувати структуру дошки', async () => {
    vi.mocked(taskService.getWorkspaceKanban).mockResolvedValueOnce(
      mockCategories,
    );

    const { result } = renderHook(() => useWorkspaceKanban(workspaceId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(taskService.getWorkspaceKanban).toHaveBeenCalledWith(workspaceId);
    expect(result.current.data).toEqual(mockCategories);
  });

  it('2. useWorkspaceKanban не має виконувати запит без workspaceId', async () => {
    const { result } = renderHook(() => useWorkspaceKanban(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(taskService.getWorkspaceKanban).not.toHaveBeenCalled();
  });

  it('3. useWorkspaceKanban має повертати помилку, якщо завантаження не вдалося', async () => {
    vi.mocked(taskService.getWorkspaceKanban).mockRejectedValueOnce(
      new Error('Failed to load board'),
    );

    const { result } = renderHook(() => useWorkspaceKanban(workspaceId), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
  });

  // --------------------------------------------------
  // useCreateColumn
  // --------------------------------------------------

  it('4. useCreateColumn має створювати колонку з переданою назвою', async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useCreateColumn(workspaceId), {
      wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync('In Progress');
    });

    expect(taskService.createColumn).toHaveBeenCalledWith(
      workspaceId,
      'In Progress',
    );

    expect(toast.success).toHaveBeenCalledWith('Column successfully created');
  });

  it('5. useCreateColumn має показувати помилку при невдалому створенні', async () => {
    vi.mocked(taskService.createColumn).mockRejectedValueOnce(
      new Error('Create failed'),
    );

    const { result } = renderHook(() => useCreateColumn(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.mutateAsync('In Progress')).rejects.toThrow(
        'Create failed',
      );
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to create column');
  });

  it('6. useCreateColumn має інвалідувати кеш дошки після успішного створення', async () => {
    const wrapper = createWrapper();

    const { result } = renderHook(() => useCreateColumn(workspaceId), {
      wrapper,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync('Done');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey,
    });
  });

  // --------------------------------------------------
  // useCreateTask
  // --------------------------------------------------

  it('7. useCreateTask має передавати payload до сервісу', async () => {
    const payload = {
      title: 'New task',
      description: 'Task description',
      columnId: 'col-1',
      workspaceId,
      priority: 'HIGH' as const,
      dueDate: '2026-12-25',
    };

    const { result } = renderHook(() => useCreateTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(payload);
    });

    expect(taskService.createTask).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledWith('Task successfully created');
  });

  it('8. useCreateTask має показувати помилку при невдалому створенні', async () => {
    vi.mocked(taskService.createTask).mockRejectedValueOnce(
      new Error('Create failed'),
    );

    const { result } = renderHook(() => useCreateTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          title: 'New task',
          description: '',
          columnId: 'col-1',
          workspaceId,
          priority: 'MEDIUM',
        }),
      ).rejects.toThrow('Create failed');
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to create task');
  });

  // --------------------------------------------------
  // useUpdateTask
  // --------------------------------------------------

  it('9. useUpdateTask має передавати ID задачі, workspaceId та payload', async () => {
    const payload = {
      title: 'Updated task',
      description: 'Updated description',
      priority: 'LOW' as const,
      dueDate: '2026-12-30',
    };

    const { result } = renderHook(() => useUpdateTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        taskId: 'task-1',
        payload,
      });
    });

    expect(taskService.updateTask).toHaveBeenCalledWith(
      'task-1',
      workspaceId,
      payload,
    );

    expect(toast.success).toHaveBeenCalledWith('Changes successfully saved');
  });

  it('10. useUpdateTask має показувати помилку при невдалому оновленні', async () => {
    vi.mocked(taskService.updateTask).mockRejectedValueOnce(
      new Error('Update failed'),
    );

    const { result } = renderHook(() => useUpdateTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          taskId: 'task-1',
          payload: {
            title: 'Updated task',
            description: '',
            priority: 'HIGH',
          },
        }),
      ).rejects.toThrow('Update failed');
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to save changes');
  });

  // --------------------------------------------------
  // useDeleteTask
  // --------------------------------------------------

  it('11. useDeleteTask має видаляти задачу з правильними ID', async () => {
    const { result } = renderHook(() => useDeleteTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('task-999');
    });

    expect(taskService.deleteTask).toHaveBeenCalledWith(
      'task-999',
      workspaceId,
    );

    expect(toast.success).toHaveBeenCalledWith('Task successfully deleted');
  });

  it('12. useDeleteTask має показувати помилку при невдалому видаленні', async () => {
    vi.mocked(taskService.deleteTask).mockRejectedValueOnce(
      new Error('Delete failed'),
    );

    const { result } = renderHook(() => useDeleteTask(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.mutateAsync('task-999')).rejects.toThrow(
        'Delete failed',
      );
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete task');
  });

  // --------------------------------------------------
  // useDeleteColumn
  // --------------------------------------------------

  it('13. useDeleteColumn має видаляти колонку з правильними ID', async () => {
    const { result } = renderHook(() => useDeleteColumn(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync('col-1');
    });

    expect(taskService.deleteColumn).toHaveBeenCalledWith('col-1', workspaceId);

    expect(toast.success).toHaveBeenCalledWith('Column successfully deleted');
  });

  it('14. useDeleteColumn має показувати помилку при невдалому видаленні', async () => {
    vi.mocked(taskService.deleteColumn).mockRejectedValueOnce(
      new Error('Delete failed'),
    );

    const { result } = renderHook(() => useDeleteColumn(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(result.current.mutateAsync('col-1')).rejects.toThrow(
        'Delete failed',
      );
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to delete column');
  });

  // --------------------------------------------------
  // useUpdateColumn
  // --------------------------------------------------

  it('15. useUpdateColumn має оновлювати назву колонки', async () => {
    const { result } = renderHook(() => useUpdateColumn(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        columnId: 'col-1',
        name: 'Completed',
      });
    });

    expect(taskService.updateColumn).toHaveBeenCalledWith(
      'col-1',
      workspaceId,
      'Completed',
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Name of the column successfully changed',
    );
  });

  it('16. useUpdateColumn має показувати помилку при невдалому оновленні', async () => {
    vi.mocked(taskService.updateColumn).mockRejectedValueOnce(
      new Error('Update failed'),
    );

    const { result } = renderHook(() => useUpdateColumn(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          columnId: 'col-1',
          name: 'Completed',
        }),
      ).rejects.toThrow('Update failed');
    });

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to change the name of the column',
    );
  });

  // --------------------------------------------------
  // useReorderTasks
  // --------------------------------------------------

  it('17. useReorderTasks має передавати новий порядок задач до сервісу', async () => {
    const tasks = [
      { id: 'task-1', position: 0, columnId: 'col-1' },
      { id: 'task-2', position: 1, columnId: 'col-1' },
    ];

    const { result } = renderHook(() => useReorderTasks(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        tasks,
        previousKanbanData: mockCategories,
      });
    });

    expect(taskService.reorderTasks).toHaveBeenCalledWith(workspaceId, tasks);
  });

  it('18. useReorderTasks має відновлювати попередні дані після помилки', async () => {
    vi.mocked(taskService.reorderTasks).mockRejectedValueOnce(
      new Error('Reorder failed'),
    );

    const wrapper = createWrapper();

    const { result } = renderHook(() => useReorderTasks(workspaceId), {
      wrapper,
    });

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          tasks: [{ id: 'task-1', position: 1, columnId: 'col-1' }],
          previousKanbanData: mockCategories,
        }),
      ).rejects.toThrow('Reorder failed');
    });

    expect(setQueryDataSpy).toHaveBeenCalledWith(queryKey, mockCategories);

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to save the order of tasks',
    );
  });

  // --------------------------------------------------
  // useReorderCategories
  // --------------------------------------------------

  it('19. useReorderCategories має передавати новий порядок колонок до сервісу', async () => {
    const categories = [
      { id: 'col-1', position: 1 },
      { id: 'col-2', position: 0 },
    ];

    const wrapper = createWrapper();

    const { result } = renderHook(() => useReorderCategories(workspaceId), {
      wrapper,
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    await act(async () => {
      await result.current.mutateAsync({
        categories,
        previousKanbanData: mockCategories,
      });
    });

    expect(taskService.reorderCategories).toHaveBeenCalledWith(
      workspaceId,
      categories,
    );

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey,
    });
  });

  it('20. useReorderCategories має відновлювати попередні дані після помилки', async () => {
    vi.mocked(taskService.reorderCategories).mockRejectedValueOnce(
      new Error('Reorder failed'),
    );

    const { result } = renderHook(() => useReorderCategories(workspaceId), {
      wrapper: createWrapper(),
    });

    const setQueryDataSpy = vi.spyOn(queryClient, 'setQueryData');

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          categories: [{ id: 'col-1', position: 1 }],
          previousKanbanData: mockCategories,
        }),
      ).rejects.toThrow('Reorder failed');
    });

    expect(setQueryDataSpy).toHaveBeenCalledWith(queryKey, mockCategories);

    expect(toast.error).toHaveBeenCalledWith(
      'Failed to save the order of columns',
    );
  });

  // --------------------------------------------------
  // useLinkDocument
  // --------------------------------------------------

  it('21. useLinkDocument має прикріплювати документ до задачі', async () => {
    const { result } = renderHook(() => useLinkDocument(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        taskId: 'task-1',
        documentId: 'doc-1',
      });
    });

    expect(taskService.linkDocument).toHaveBeenCalledWith(
      'task-1',
      workspaceId,
      'doc-1',
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Document attached successfully',
    );
  });

  it('22. useLinkDocument має показувати помилку при невдалому прикріпленні', async () => {
    vi.mocked(taskService.linkDocument).mockRejectedValueOnce(
      new Error('Link failed'),
    );

    const { result } = renderHook(() => useLinkDocument(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          taskId: 'task-1',
          documentId: 'doc-1',
        }),
      ).rejects.toThrow('Link failed');
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to attach document');
  });

  // --------------------------------------------------
  // useUnlinkDocument
  // --------------------------------------------------

  it('23. useUnlinkDocument має відкріплювати документ від задачі', async () => {
    const { result } = renderHook(() => useUnlinkDocument(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync({
        taskId: 'task-1',
        documentId: 'doc-1',
      });
    });

    expect(taskService.unlinkDocument).toHaveBeenCalledWith(
      'task-1',
      workspaceId,
      'doc-1',
    );

    expect(toast.success).toHaveBeenCalledWith(
      'Document detached successfully',
    );
  });

  it('24. useUnlinkDocument має показувати помилку при невдалому відкріпленні', async () => {
    vi.mocked(taskService.unlinkDocument).mockRejectedValueOnce(
      new Error('Unlink failed'),
    );

    const { result } = renderHook(() => useUnlinkDocument(workspaceId), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          taskId: 'task-1',
          documentId: 'doc-1',
        }),
      ).rejects.toThrow('Unlink failed');
    });

    expect(toast.error).toHaveBeenCalledWith('Failed to detach document');
  });
});
