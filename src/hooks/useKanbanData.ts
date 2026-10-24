// ua: хук для отримання даних - канбан-дошки

// ua: згорнення сервісів в один хук для зручності використання в компонентах

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { toast } from 'sonner';
import { TaskCategory } from '@/types/kanban';

// ua: хук для отримання всієї структури дошки
export const useWorkspaceKanban = (workspaceId: string) => {
  return useQuery({
    queryKey: ['workspace-kanban', workspaceId],
    queryFn: () => taskService.getWorkspaceKanban(workspaceId),
    enabled: !!workspaceId,
  });
};

// ua: хук для створення нової колонки задач
export const useCreateColumn = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => taskService.createColumn(workspaceId, name),
    onSuccess: () => {
      toast.success('Column successfully created');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to create column');
    },
  });
};

// ua: хук для створення нової картки задачі
export const useCreateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      title: string;
      description: string;
      columnId: string;
      workspaceId: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH';
      dueDate?: string;
    }) => taskService.createTask(payload),
    onSuccess: () => {
      toast.success('Task successfully created');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to create task');
    },
  });
};

// ua хук для збереження змін при редагуванні картки завдання
export const useUpdateTask = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      payload,
    }: {
      taskId: string;
      payload: {
        title: string;
        description: string;
        priority: 'LOW' | 'MEDIUM' | 'HIGH';
        dueDate?: string;
      };
    }) => taskService.updateTask(taskId, workspaceId, payload),
    onSuccess: () => {
      toast.success('Changes successfully saved');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to save changes');
    },
  });
};

// ua хук для видалення картки завдання
export const useDeleteTask = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId, workspaceId),
    onSuccess: () => {
      toast.success('Task successfully deleted');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to delete task');
    },
  });
};

export const useDeleteColumn = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (columnId: string) =>
      taskService.deleteColumn(columnId, workspaceId),
    onSuccess: () => {
      toast.success('Column successfully deleted');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to delete column');
    },
  });
};

// ua: хук для оновлення назви колонки задач
export const useUpdateColumn = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ columnId, name }: { columnId: string; name: string }) =>
      taskService.updateColumn(columnId, workspaceId, name),
    onSuccess: () => {
      toast.success('Name of the column successfully changed');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to change the name of the column');
    },
  });
};

// ua: хук перетягування тасок (dnd)

export const useReorderTasks = (workspaceId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['workspace-kanban', workspaceId];

  type ReorderPayload = {
    id: string;
    position: number;
    columnId: string;
  };

  type ReorderVariables = {
    tasks: ReorderPayload[];
    previousKanbanData: TaskCategory[];
  };

  return useMutation({
    mutationFn: ({ tasks }: ReorderVariables) =>
      taskService.reorderTasks(workspaceId, tasks),

    onError: (_error, variables) => {
      queryClient.setQueryData(queryKey, variables.previousKanbanData);

      toast.error('Failed to save the order of tasks');
    },
  });
};

// dnd doc

// link doc (закріплення документа)
export const useLinkDocument = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      documentId,
    }: {
      taskId: string;
      documentId: string;
    }) => taskService.linkDocument(taskId, workspaceId, documentId),
    onSuccess: () => {
      toast.success('Document attached successfully');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to attach document');
    },
  });
};

// unlinked (відкріплення документа)
export const useUnlinkDocument = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      documentId,
    }: {
      taskId: string;
      documentId: string;
    }) => taskService.unlinkDocument(taskId, workspaceId, documentId),
    onSuccess: () => {
      toast.success('Document detached successfully');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Failed to detach document');
    },
  });
};
