// ai tests - hook useWorkspaces

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useCreateWorkspace } from '../useCreateWorkspace';

import { workspaceService } from '@/services/workspace.service';
import { handleGlobalError } from '@/utils/error-handler';
import { toast } from 'sonner';
import type { CreateWorkspaceDTO } from '@/services/workspace.service';

// ua: моки сервісів та глобальних обробників
vi.mock('@/services/workspace.service', () => ({
  workspaceService: {
    createWorkspace: vi.fn(),
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

// ua: створення тестового QueryClient
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

// ua: обгортка для підключення QueryClientProvider
const createWrapper = (queryClient: QueryClient) => {
  return function TestWrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

// ua: тестові дані для створення воркспейсу
const mockWorkspaceDTO = {
  name: 'Marketing Team',
  visibility: 'PRIVATE',
} as CreateWorkspaceDTO;

describe('useCreateWorkspace', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('1. має викликати createWorkspace з переданим DTO', async () => {
    vi.mocked(workspaceService.createWorkspace).mockResolvedValue({
      id: 'workspace-1',
      ...mockWorkspaceDTO,
    } as Awaited<ReturnType<typeof workspaceService.createWorkspace>>);

    const { result } = renderHook(() => useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockWorkspaceDTO);
    });

    expect(workspaceService.createWorkspace).toHaveBeenCalledWith(
      mockWorkspaceDTO,
    );
  });

  it('2. має інвалідувати кеш воркспейсів після успішного створення', async () => {
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.mocked(workspaceService.createWorkspace).mockResolvedValue({
      id: 'workspace-1',
      ...mockWorkspaceDTO,
    } as Awaited<ReturnType<typeof workspaceService.createWorkspace>>);

    const { result } = renderHook(() => useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockWorkspaceDTO);
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['workspaces'],
    });
  });

  it('3. має показувати повідомлення про успішне створення', async () => {
    vi.mocked(workspaceService.createWorkspace).mockResolvedValue({
      id: 'workspace-1',
      ...mockWorkspaceDTO,
    } as Awaited<ReturnType<typeof workspaceService.createWorkspace>>);

    const { result } = renderHook(() => useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockWorkspaceDTO);
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Workspace created successfully!',
    );
  });

  it('4. має викликати onSuccessCb після успішного створення', async () => {
    const onSuccessCb = vi.fn();

    vi.mocked(workspaceService.createWorkspace).mockResolvedValue({
      id: 'workspace-1',
      ...mockWorkspaceDTO,
    } as Awaited<ReturnType<typeof workspaceService.createWorkspace>>);

    const { result } = renderHook(() => useCreateWorkspace({ onSuccessCb }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockWorkspaceDTO);
    });

    expect(onSuccessCb).toHaveBeenCalledTimes(1);
  });

  it('5. має працювати без переданого onSuccessCb', async () => {
    vi.mocked(workspaceService.createWorkspace).mockResolvedValue({
      id: 'workspace-1',
      ...mockWorkspaceDTO,
    } as Awaited<ReturnType<typeof workspaceService.createWorkspace>>);

    const { result } = renderHook(() => useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(mockWorkspaceDTO);
    });

    expect(toast.success).toHaveBeenCalledWith(
      'Workspace created successfully!',
    );
  });

  it('6. має передавати помилку до глобального обробника', async () => {
    const error = new Error('Create failed');

    vi.mocked(workspaceService.createWorkspace).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateWorkspace(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync(mockWorkspaceDTO),
      ).rejects.toThrow('Create failed');
    });

    expect(handleGlobalError).toHaveBeenCalledWith(error);
  });

  it('7. не має викликати onSuccessCb, якщо створення завершилося помилкою', async () => {
    const error = new Error('Create failed');
    const onSuccessCb = vi.fn();

    vi.mocked(workspaceService.createWorkspace).mockRejectedValue(error);

    const { result } = renderHook(() => useCreateWorkspace({ onSuccessCb }), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await expect(
        result.current.mutateAsync(mockWorkspaceDTO),
      ).rejects.toThrow('Create failed');
    });

    expect(onSuccessCb).not.toHaveBeenCalled();
  });
});
