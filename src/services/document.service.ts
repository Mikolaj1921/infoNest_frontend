//fix with ai problem with doc problems

import api from '@/lib/axios';
import axios from 'axios';

//types
import {
  WorkspaceDocument,
  DocumentRevision,
  WorkspaceCategory,
  DocumentVisibility,
  WorkspaceStructureResponse,
  DocumentRevisionsResponse,
} from '@/types/document';

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

// dto для відповіді на запит отримання одного документа
export interface SingleDocumentResponse {
  success: boolean;
  data: {
    document: WorkspaceDocument;
  };
}

export interface DocumentActionResponse {
  success: boolean;
  data: WorkspaceDocument;
}

// ua: сервіс для роботи з документами воркспейсу
export const documentService = {
  // ua: отримання структури воркспейсу (категорії + документи)
  getWorkspaceStructure: async (
    workspaceId: string,
  ): Promise<WorkspaceCategory[]> => {
    try {
      const { data } = await api.get<WorkspaceStructureResponse>(
        `/workspaces/${workspaceId}/structure`,
      );

      console.log('[infoNest DEBUG] Дані структури від бекенду:', data);
      const res: WorkspaceStructureResponse | null = data;

      if (res && typeof res === 'object' && res.success === true && res.data) {
        // Варіант 1: Якщо дані прийшли прямим масивом (як ми очікували)
        if (Array.isArray(res.data)) {
          return res.data;
        }

        // Варіант 2: Якщо бекенд загорнув масив в об'єкт { categories: [...] }
        const dataObj = res.data as unknown as Record<string, unknown>;
        if (
          typeof dataObj === 'object' &&
          dataObj !== null &&
          'categories' in dataObj &&
          Array.isArray(dataObj.categories)
        ) {
          return dataObj.categories as WorkspaceCategory[];
        }

        // Варіант 3: Якщо бекенд загорнув масив в об'єкт { structure: [...] }
        if (
          typeof dataObj === 'object' &&
          dataObj !== null &&
          'structure' in dataObj &&
          Array.isArray(dataObj.structure)
        ) {
          return dataObj.structure as WorkspaceCategory[];
        }
      }

      return [];
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.log(
          `[infoNest] Workspace ${workspaceId} is empty. Rendering empty Sidebar structure.`,
        );
        return [];
      }
      return Promise.reject(error);
    }
  },

  // ua: отримання одного документа
  getDocumentbyId: async (docId: string): Promise<WorkspaceDocument | null> => {
    const { data } = await api.get<SingleDocumentResponse>(
      `/documents/${docId}`,
    );

    const res = data as SingleDocumentResponse | null;
    if (
      res &&
      typeof res === 'object' &&
      res.success === true &&
      res.data &&
      typeof res.data === 'object' &&
      'document' in res.data
    ) {
      return res.data.document;
    }

    return null;
  },

  // manual update document
  updateDocument: async (
    docId: string,
    dto: UpdateDocumentDTO,
    signal?: AbortSignal, // ua: параметр для сигналу скасування запиту
  ): Promise<WorkspaceDocument> => {
    const { data } = await api.patch<SingleDocumentResponse>(
      `/documents/${docId}`,
      dto,
      { signal },
    );

    const res = data as SingleDocumentResponse | null;
    if (
      res &&
      typeof res === 'object' &&
      res.success === true &&
      res.data &&
      typeof res.data === 'object' &&
      'document' in res.data
    ) {
      return res.data.document;
    }

    throw new Error(
      'Invalid response structure from server during document saving',
    );
  },

  // ua: створення нового документа в конкретній категорії
  createDocument: async (
    categoryId: string,
    dto: CreateDocumentDTO,
  ): Promise<WorkspaceDocument> => {
    const { data } = await api.post<DocumentActionResponse>('/documents', {
      ...dto,
      categoryId,
    });

    const res: DocumentActionResponse | null = data;

    if (res && typeof res === 'object' && res.success === true && res.data) {
      // ua: Безпечне приведення типів через unknown для задоволення лінтера
      const dataObj = res.data as unknown as Record<string, unknown>;

      // Варіант 1: Якщо бэкенд загорнув документ в об'єкт { document: {...} }
      if (
        typeof dataObj === 'object' &&
        dataObj !== null &&
        'document' in dataObj &&
        dataObj.document &&
        typeof dataObj.document === 'object'
      ) {
        return dataObj.document as WorkspaceDocument;
      }

      // Варіант 2: Якщо бэкенд віддав документ прямим об'єктом у data
      return res.data;
    }

    throw new Error('Invalid response structure during document creation');
  },

  // ua: повне видалення конкретного документа за його id
  deleteDocument: async (documentId: string): Promise<void> => {
    await api.delete(`/documents/${documentId}`);
  },

  // ua: отримання списку ревізій (історії змін) конкретного документа
  getDocumentRevisions: async (
    documentId: string,
  ): Promise<DocumentRevision[]> => {
    // ua: Повністю прибрали any з типізації Axios запиту
    const { data } = await api.get<DocumentRevisionsResponse>(
      `/documents/${documentId}/revisions`,
    );

    const res: DocumentRevisionsResponse | null = data;

    if (res && typeof res === 'object' && res.success === true && res.data) {
      // ua: Використовуємо імпортований тип для суворої перевірки
      const dataObj = res.data as unknown as Record<string, unknown>;

      if (
        typeof dataObj === 'object' &&
        dataObj !== null &&
        'revisions' in dataObj &&
        Array.isArray(dataObj.revisions)
      ) {
        return dataObj.revisions as DocumentRevision[];
      }

      if (Array.isArray(res.data)) {
        return res.data;
      }
    }

    return [];
  },
};
