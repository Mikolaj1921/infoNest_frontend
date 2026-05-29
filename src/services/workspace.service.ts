import api from '@/lib/axios';
// types
import {
  Workspace,
  WorkspacesResponse,
  SingleWorkspaceResponse,
  WorkspaceVisibility,
} from '@/types/workspace';

// validators - для runtime перевірки структури відповіді сервера
import {
  isValidSingleWorkspaceResponse,
  isValidWorkspacesResponse,
} from '@/utils/workspace-validators';

// dto для створення воркспейсу (вхідні дані беку)
export interface CreateWorkspaceDTO {
  name: string;
  visibility: WorkspaceVisibility;
}

// dto для оновлення воркспейсу
export interface UpdateWorkspaceDTO {
  name?: string;
  visibility?: WorkspaceVisibility;
}

// ua: сервіс для роботи з воркспейсами
export const workspaceService = {
  // -------------
  // ua: отримання списку воркспейсів для поточного користувача
  getAllWorkspaces: async (): Promise<Workspace[]> => {
    // ua: запит до /workspaces
    const { data } = await api.get<WorkspacesResponse>('/workspaces');

    // ua: для безпечної перевірки рантайму через наш утилітний валідатор
    if (isValidWorkspacesResponse(data)) {
      return data.data; // ua: тепер TypeScript чітко знає, що це Workspace[]
    }

    // ua: вийняток для випадку якби бек повернув об'єкт з вкладеним масивом
    const rawData = (data as Record<string, unknown> | null)?.data as unknown;
    if (rawData && typeof rawData === 'object' && 'workspaces' in rawData) {
      const nested = rawData as { workspaces: unknown };
      if (Array.isArray(nested.workspaces)) {
        return nested.workspaces as Workspace[];
      }
    }

    // ua: захисна заглушка, якщо структура не відповідає очікуваній
    return [];
  },

  // -------------
  // ua: створення нового воркспейсу
  createWorkspace: async (dto: CreateWorkspaceDTO): Promise<Workspace> => {
    // ua: запит до /workspaces з даними для створення

    const { data } = await api.post<SingleWorkspaceResponse>(
      '/workspaces',
      dto,
    );

    // ua: валідація відповіді беку
    if (isValidSingleWorkspaceResponse(data)) {
      return data.data.workspace;
    }

    // ua: якщо бекенд повернув неочікувану структуру даних
    throw new Error(
      'Invalid response structure from server during workspace creation',
    );
  },

  // -------------
  // ua: оновлення воркспейсу
  updateWorkspace: async (
    id: string,
    dto: Partial<UpdateWorkspaceDTO>,
  ): Promise<Workspace> => {
    const { data } = await api.put<SingleWorkspaceResponse>(
      `/workspaces/${id}`,
      dto,
    );

    if (isValidSingleWorkspaceResponse(data)) {
      return data.data.workspace;
    }

    throw new Error(
      'Invalid response structure from server during workspace update',
    );
  },

  // -------------
  // ua: видалення воркспейсу
  deleteWorkspace: async (id: string): Promise<void> => {
    await api.delete(`/workspaces/${id}`);
  },
};
