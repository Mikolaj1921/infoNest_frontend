// ua: enum для видимості документа
export enum DocumentVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

// ua: інтерфейс для детальної інформації про користувача (автора/редактора)
export interface WorkspaceUserSimp {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

// ua: інтерфейс для документа воркспейсу
export interface WorkspaceDocument {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  ownerId: string;
  visibility: DocumentVisibility; // visibility
  owner?: WorkspaceUserSimp; // ua: розширені дані про автора документа для метаданих
  createdAt: string;
  updatedAt: string;
}

// ua: інтерфейс для збереженої ревізії (історії змін) документа
export interface DocumentRevision {
  id: string;
  documentId: string;
  content: string;
  createdAt: string;
  editor: WorkspaceUserSimp; // ua: хто саме зберіг цю конкретну версію
}

// ua: для відповіді API при отриманні списку ревізій
export interface DocumentRevisionsResponse {
  success: boolean;
  data: DocumentRevision[];
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
