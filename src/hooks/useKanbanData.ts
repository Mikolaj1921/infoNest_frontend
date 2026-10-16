// ua: хук для отримання даних - канбан-дошки

// ua: згорнення сервісів в один хук для зручності використання в компонентах

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { toast } from 'sonner';

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
      };
    }) => taskService.updateTask(taskId, payload),
    onSuccess: () => {
      toast.success('Зміни успішно збережено');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Не вдалося зберегти зміни');
    },
  });
};

// ua хук для видалення картки завдання
export const useDeleteTask = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.deleteTask(taskId),
    onSuccess: () => {
      toast.success('Завдання успішно видалено');
      queryClient.invalidateQueries({
        queryKey: ['workspace-kanban', workspaceId],
      });
    },
    onError: () => {
      toast.error('Не вдалося видалити завдання');
    },
  });
};
