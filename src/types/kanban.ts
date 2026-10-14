// ua: типи для канбан-дошки (трело)

// ua: пріоритети для карток задач
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

// ua: інтерфейс для картки задачі канбан
export interface BoardTask {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  ownerId: string;
  priority: TaskPriority;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{ id: string; title: string }>; // ua: прикріплені внутрішні документи
}

// ua: інтерфейс для колонки задач (категорії)
export interface TaskCategory {
  id: string;
  name: string;
  workspaceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  boardTasks: BoardTask[];
}

// ua: базові відповіді api для квері-сервісів
export interface KanbanStructureResponse {
  success: boolean;
  data: {
    categories: TaskCategory[];
  };
}

export interface BoardTaskResponse {
  success: boolean;
  data: {
    task: BoardTask;
  };
}

export interface TaskCategoryResponse {
  success: boolean;
  data: {
    category: TaskCategory;
  };
}
