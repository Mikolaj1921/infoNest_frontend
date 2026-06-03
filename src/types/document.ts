// ua: enum для видимості документа
export enum DocumentVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

// ua: інтерфейс для документа воркспейсу
export interface WorkspaceDocument {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  ownerId: string;
  visibility: DocumentVisibility; // visibility
  createdAt: string;
  updatedAt: string;
}

// ua: category для документа воркспейсу
export interface WorkspaceCategory {
  id: string;
  name: string;
  workspaceId: string;
  documents: WorkspaceDocument[]; // ua: масив документів у категорії
  createdAt: string;
  updatedAt: string;
}

// ua: для відповіді API при отриманні списку документів
export interface WorkspaceStructureResponse {
  success: boolean;
  data: WorkspaceCategory[]; // ua: масив категорій з документами
}
