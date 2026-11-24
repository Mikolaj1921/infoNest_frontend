// ai tests - hook useWorkspaceMutation

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import {
  useUpdateWorkspace,
  useDeleteWorkspace,
} from '../use-workspace-mutations';

import { workspaceService } from '@/services/workspace.service';
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';
import type { Workspace } from '@/types/workspace';

// ua: моки сервісів та глобальних обробників
vi.mock('@/services/workspace.service', () => ({
  workspaceService: {
    updateWorkspace: vi.fn(),
    deleteWorkspace: vi.fn(),
  },
}));

vi.mock('@/utils/error-handler', () => ({
  handleGlobalError: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}));

// ua: тестовий QueryClient та обгортка провайдера
const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';

  return Wrapper;
};

// ua: початкові дані воркспейсів
const mockWorkspaces = [
  {
    id: 'workspace-1',
    name: 'Marketing',
    ownerId: 'user-1',
  },
  {
    id: 'workspace-2',
    name: 'Development',
    ownerId: 'user-1',
  },
] as Workspace[];

// ua: створення ізольованого QueryClient для кожного тесту
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

describe('useUpdateWorkspace', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('1. має викликати updateWorkspace з правильними аргументами', async () => {
    const updatedWorkspace = {
      ...mockWorkspaces[0],
      name: 'Updated Marketing',
    };

    vi.mocked(workspaceService.updateWorkspace).mockResolvedValue(
      updatedWorkspace,
    );

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        workspaceId: 'workspace-1',
        dto: { name: 'Updated Marketing' },
      });
    });

    expect(workspaceService.updateWorkspace).toHaveBeenCalledWith(
      'workspace-1',
      { name: 'Updated Marketing' },
    );
  });

  it('2. має оновлювати відповідний воркспейс у кеші після успіху', async () => {
    const updatedWorkspace = {
      ...mockWorkspaces[0],
      name: 'Updated Marketing',
    };

    queryClient.setQueryData(['workspaces'], mockWorkspaces);

    vi.mocked(workspaceService.updateWorkspace).mockResolvedValue(
      updatedWorkspace,
    );

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        workspaceId: 'workspace-1',
        dto: { name: 'Updated Marketing' },
      });
    });

    const cachedWorkspaces = queryClient.getQueryData<Workspace[]>([
      'workspaces',
    ]);

    expect(cachedWorkspaces?.[0]).toEqual(updatedWorkspace);
    expect(cachedWorkspaces?.[1]).toEqual(mockWorkspaces[1]);
  });

  it('3. не має змінювати кеш, якщо список воркспейсів відсутній', async () => {
    const updatedWorkspace = {
      ...mockWorkspaces[0],
      name: 'Updated Marketing',
    };

    vi.mocked(workspaceService.updateWorkspace).mockResolvedValue(
      updatedWorkspace,
    );

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        workspaceId: 'workspace-1',
        dto: { name: 'Updated Marketing' },
      });
    });

    expect(queryClient.getQueryData(['workspaces'])).toBeUndefined();
  });

  it('4. має інвалідувати кеш воркспейсів після успіху', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(workspaceService.updateWorkspace).mockResolvedValue({
      ...mockWorkspaces[0],
      name: 'Updated Marketing',
    });

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        workspaceId: 'workspace-1',
        dto: { name: 'Updated Marketing' },
      });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['workspaces'],
    });
  });

  it('5. має показувати повідомлення про успішне оновлення', async () => {
    vi.mocked(workspaceService.updateWorkspace).mockResolvedValue(
      mockWorkspaces[0],
    );

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        workspaceId: 'workspace-1',
        dto: { name: 'Marketing' },
      });
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Workspace updated successfully!',
    );
  });

  it('6. має передавати помилку до глобального обробника', async () => {
    const error = new Error('Update failed');

    vi.mocked(workspaceService.updateWorkspace).mockRejectedValue(error);

    const { result } = renderHook(() => useUpdateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync({
          workspaceId: 'workspace-1',
          dto: { name: 'Updated Marketing' },
        }),
      ).rejects.toThrow('Update failed');
    });

    expect(handleGlobalError).toHaveBeenCalledWith(error);
  });
});

describe('useDeleteWorkspace', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('7. має викликати deleteWorkspace з правильним ID', async () => {
    vi.mocked(workspaceService.deleteWorkspace).mockResolvedValue(
      undefined as never,
    );

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('workspace-1');
    });

    expect(workspaceService.deleteWorkspace).toHaveBeenCalledWith(
      'workspace-1',
    );
  });

  it('8. має видаляти відповідний воркспейс із кешу після успіху', async () => {
    queryClient.setQueryData(['workspaces'], mockWorkspaces);

    vi.mocked(workspaceService.deleteWorkspace).mockResolvedValue(
      undefined as never,
    );

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('workspace-1');
    });

    expect(queryClient.getQueryData<{ id: string }[]>(['workspaces'])).toEqual([
      mockWorkspaces[1],
    ]);
  });

  it('9. не має змінювати кеш, якщо список воркспейсів відсутній', async () => {
    vi.mocked(workspaceService.deleteWorkspace).mockResolvedValue(
      undefined as never,
    );

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('workspace-1');
    });

    expect(queryClient.getQueryData(['workspaces'])).toBeUndefined();
  });

  it('10. має інвалідувати кеш воркспейсів після успіху', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(workspaceService.deleteWorkspace).mockResolvedValue(
      undefined as never,
    );

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('workspace-1');
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['workspaces'],
    });
  });

  it('11. має показувати повідомлення про успішне видалення', async () => {
    vi.mocked(workspaceService.deleteWorkspace).mockResolvedValue(
      undefined as never,
    );

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync('workspace-1');
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Workspace deleted successfully!',
    );
  });

  it('12. має передавати помилку до глобального обробника', async () => {
    const error = new Error('Delete failed');

    vi.mocked(workspaceService.deleteWorkspace).mockRejectedValue(error);

    const { result } = renderHook(() => useDeleteWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(result.current.mutateAsync('workspace-1')).rejects.toThrow(
        'Delete failed',
      );
    });

    expect(handleGlobalError).toHaveBeenCalledWith(error);
  });
});
