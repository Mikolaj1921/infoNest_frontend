import api from '@/lib/axios';
import { Workspace, WorkspacesResponse } from '@/types/workspace';

// ua: сервіс для роботи з воркспейсами
export const workspaceService = {
  // ua: отримання списку воркспейсів для поточного користувача

  getAllWorkspaces: async (): Promise<Workspace[]> => {
    // ua: запит до /workspaces
    const { data } = await api.get<WorkspacesResponse>('/workspaces');

    // ua: для безпечної перевірки рантайму
    const rawData = data?.data as unknown;

    // ua: якби бек повернув масив воркспейсів напряму - очікуваний результат
    if (Array.isArray(rawData)) {
      return rawData as Workspace[];
    }

    // ua: вийняток для випадку якби бек повернув об'єкт з вкладеним масивом
    if (rawData && typeof rawData === 'object' && 'workspaces' in rawData) {
      const nested = rawData as { workspaces: unknown };
      if (Array.isArray(nested.workspaces)) {
        return nested.workspaces as Workspace[];
      }
    }

    // ua: захисна заглушка, якщо структура не відповідає очікуваній
    return [];
  },
};
