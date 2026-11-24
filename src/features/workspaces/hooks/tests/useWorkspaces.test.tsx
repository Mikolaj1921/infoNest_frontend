// ai tests - hook useWorkspaces

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useWorkspaces } from '../useWorkspaces';
import { workspaceService } from '@/services/workspace.service';
import { handleGlobalError } from '@/utils/error-handler';

// ua: моки сервісу та глобальної обробки помилок
vi.mock('@/services/workspace.service', () => ({
  workspaceService: {
    getAllWorkspaces: vi.fn(),
  },
}));

vi.mock('@/utils/error-handler', () => ({
  handleGlobalError: vi.fn(),
}));

const mockWorkspaces = [
  {
    id: 'workspace-1',
    name: 'Workspace One',
    visibility: 'PRIVATE',
    ownerId: 'user-1',
  },
  {
    id: 'workspace-2',
    name: 'Workspace Two',
    visibility: 'PUBLIC',
    ownerId: 'user-1',
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
};

describe('useWorkspaces', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = createTestQueryClient();
  });

  it('should call getAllWorkspaces service', async () => {
    vi.mocked(workspaceService.getAllWorkspaces).mockResolvedValue(
      mockWorkspaces as Awaited<
        ReturnType<typeof workspaceService.getAllWorkspaces>
      >,
    );

    renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(workspaceService.getAllWorkspaces).toHaveBeenCalledTimes(1);
    });
  });

  it('should use the correct query key', async () => {
    vi.mocked(workspaceService.getAllWorkspaces).mockResolvedValue(
      mockWorkspaces as Awaited<
        ReturnType<typeof workspaceService.getAllWorkspaces>
      >,
    );

    renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(['workspaces'])).toEqual(mockWorkspaces);
    });
  });

  it('should use a stale time of five minutes', () => {
    vi.mocked(workspaceService.getAllWorkspaces).mockResolvedValue(
      mockWorkspaces as Awaited<
        ReturnType<typeof workspaceService.getAllWorkspaces>
      >,
    );

    renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    const query = queryClient
      .getQueryCache()
      .find({ queryKey: ['workspaces'] });

    expect((query?.options as { staleTime?: number }).staleTime).toBe(
      5 * 60 * 1000,
    );
  });

  it('should return the fetched workspaces', async () => {
    vi.mocked(workspaceService.getAllWorkspaces).mockResolvedValue(
      mockWorkspaces as Awaited<
        ReturnType<typeof workspaceService.getAllWorkspaces>
      >,
    );

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWorkspaces);
  });

  it('should expose an error when the request fails', async () => {
    const mockError = new Error('Failed to fetch workspaces');

    vi.mocked(workspaceService.getAllWorkspaces).mockRejectedValue(mockError);

    const { result } = renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBe(mockError);
  });

  it('should call handleGlobalError when the query fails', async () => {
    const mockError = new Error('Failed to fetch workspaces');

    vi.mocked(workspaceService.getAllWorkspaces).mockRejectedValue(mockError);

    renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(handleGlobalError).toHaveBeenCalledWith(mockError);
    });
  });

  it('should not call handleGlobalError when the query succeeds', async () => {
    vi.mocked(workspaceService.getAllWorkspaces).mockResolvedValue(
      mockWorkspaces as Awaited<
        ReturnType<typeof workspaceService.getAllWorkspaces>
      >,
    );

    renderHook(() => useWorkspaces(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(['workspaces'])).toEqual(mockWorkspaces);
    });

    expect(handleGlobalError).not.toHaveBeenCalled();
  });
});
