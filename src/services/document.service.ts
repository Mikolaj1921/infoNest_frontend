import api from '@/lib/axios';

//types
import {
  WorkspaceDocument,
  DocumentRevision,
  WorkspaceCategory,
  DocumentVisibility,
  WorkspaceStructureResponse,
  DocumentRevisionsResponse,
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

  // ua: отримання одного документа
  getDocumentbyId: async (docId: string): Promise<WorkspaceDocument | null> => {
    const { data } = await api.get<SingleDocumentResponse>(
      `/documents/${docId}`,
    );

    // ua: перевірка
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
    // get data
    const { data } = await api.patch<SingleDocumentResponse>(
      `/documents/${docId}`,
      dto,
      { signal },
    );

    // ua: перевірка
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
    const { data } = await api.post<DocumentActionResponse>(
      `/categories/${categoryId}/documents`,
      dto,
    );

    const res = data as DocumentActionResponse | null;
    if (res && typeof res === 'object' && res.success === true && res.data) {
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
    const { data } = await api.get<DocumentRevisionsResponse>(
      `/documents/${documentId}/revisions`,
    );

    const res = data as DocumentRevisionsResponse | null;
    if (
      res &&
      typeof res === 'object' &&
      res.success === true &&
      Array.isArray(res.data)
    ) {
      return res.data;
    }

    throw new Error(
      'Invalid response structure during fetching document revisions',
    );
  },
};
