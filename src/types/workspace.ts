// ua: enum для видимості воркспейсу
export enum WorkspaceVisibility {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

// ua: інтерфейс для воркспейсу
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  visibility: WorkspaceVisibility;
  createdAt: string;
  updatedAt: string;
}

// ua: інтерфейс для відповіді API при отриманні списку воркспейсів
export interface WorkspacesResponse {
  workspaces: Workspace[];
  message: string;
}
