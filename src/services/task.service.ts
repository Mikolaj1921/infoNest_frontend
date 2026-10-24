// services - tasks - kanban board

import api from '@/lib/axios';
import {
  TaskCategory,
  BoardTask,
  KanbanStructureResponse,
  BoardTaskResponse,
  TaskCategoryResponse,
} from '@/types/kanban';

// crud operations for kanban board tasks and categories
export const taskService = {
  // ua: отримання всіх колонок із тасками конкретного воркспейсу
  getWorkspaceKanban: async (workspaceId: string): Promise<TaskCategory[]> => {
    const { data } = await api.get<KanbanStructureResponse>(
      `/task-categories/workspace/${workspaceId}`,
    );
    return data?.success ? data.data.categories : [];
  },

  // ua: створення нової колонки (категорії задач)
  createColumn: async (
    workspaceId: string,
    name: string,
  ): Promise<TaskCategory> => {
    const { data } = await api.post<TaskCategoryResponse>('/task-categories', {
      name,
      workspaceId,
    });
    return data.data.category;
  },

  // ua: створення нової картки задачі всередині колонки
  createTask: async (payload: {
    title: string;
    description?: string;
    columnId: string;
    workspaceId: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate?: string;
  }): Promise<BoardTask> => {
    const { data } = await api.post<BoardTaskResponse>('/board-tasks', payload);
    return data.data.task;
  },

  // ua: оновлення картки задачі
  updateTask: async (
    taskId: string,
    workspaceId: string,
    payload: {
      title: string;
      description: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
    },
  ): Promise<BoardTask> => {
    const { data } = await api.patch<BoardTaskResponse>(
      `/board-tasks/${taskId}?workspaceId=${workspaceId}`, // передача workspaceId в арг
      payload,
    );
    return data.data.task;
  },

  // ua: оновлення позицій масиву задач при перетягуванні (drag and drop)
  reorderTasks: async (
    workspaceId: string,
    tasks: Array<{ id: string; position: number; columnId: string }>,
  ): Promise<void> => {
    await api.patch('/board-tasks/reorder', {
      workspaceId,
      tasks,
    });
  },

  deleteTask: async (taskId: string, workspaceId: string): Promise<void> => {
    await api.delete(`/board-tasks/${taskId}?workspaceId=${workspaceId}`); // аналогічно як з апдейтами
  },

  deleteColumn: async (
    columnId: string,
    workspaceId: string,
  ): Promise<void> => {
    await api.delete(`/task-categories/${columnId}?workspaceId=${workspaceId}`);
  },

  updateColumn: async (
    columnId: string,
    workspaceId: string,
    name: string,
  ): Promise<TaskCategory> => {
    const { data } = await api.patch<TaskCategoryResponse>(
      `/task-categories/${columnId}?workspaceId=${workspaceId}`,
      { name },
    );
    return data.data.category;
  },

  // dnd doc

  linkDocument: async (
    taskId: string,
    workspaceId: string,
    documentId: string,
  ): Promise<BoardTask> => {
    const { data } = await api.post<BoardTaskResponse>(
      `/board-tasks/${taskId}/attachments?workspaceId=${encodeURIComponent(workspaceId)}`,
      { documentId },
    );
    return data.data.task;
  },

  unlinkDocument: async (
    taskId: string,
    workspaceId: string,
    documentId: string,
  ): Promise<void> => {
    await api.delete(
      `/board-tasks/${taskId}/attachments/${documentId}?workspaceId=${encodeURIComponent(workspaceId)}`,
    );
  },
};
