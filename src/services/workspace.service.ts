import api from '@/lib/axios';
import { Workspace, WorkspacesResponse } from '@/types/workspace';

// ua: сервіс для роботи з воркспейсами
export const workspaceService = {
  // ua: отримання списку воркспейсів для поточного користувача

  getAllWorkspaces: async (): Promise<Workspace[]> => {
    // ua: запит до /workspaces
    const { data } = await api.get<WorkspacesResponse>('/workspaces');
    return data.workspaces;
  },
};
