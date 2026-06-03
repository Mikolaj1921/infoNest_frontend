import api from '@/lib/axios';

//types
import {
  //WorkspaceDocument,
  WorkspaceCategory,
  DocumentVisibility,
  WorkspaceStructureResponse,
} from '@/types/document';

// validator

// dto для створення документа
export interface CreateDocumentDTO {
  title: string;
  content: string;
  categoryId: string;
  visibility: DocumentVisibility;
}

// dto для оновлення документа
export interface UpdateDocumentDTO {
  title?: string;
  content?: string;
  categoryId?: string;
  visibility?: DocumentVisibility;
}

// ua: сервіс для роботи з документами воркспейсу
export const documentService = {
  // ua: отримання структури воркспейсу (категорії + документи)
  getWorkspaceStructure: async (
    workspaceId: string,
  ): Promise<WorkspaceCategory[]> => {
    // get data
    const { data } = await api.get<WorkspaceStructureResponse>(
      `/workspaces/${workspaceId}/structure`,
    );

    const res = data as WorkspaceStructureResponse | null;

    // ua: перевірка структури відповіді через просту валідацію
    if (
      res &&
      typeof res === 'object' &&
      res.success === true &&
      Array.isArray(res.data)
    ) {
      return res.data; // ua: перевірений масив категорій з документами
    }

    return []; // ua: заглушка
  },
};
