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
      columnId: string;
      workspaceId: string;
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
