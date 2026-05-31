import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createWorkspaceSchema,
  CreateWorkspaceInput,
} from '@/validators/workspace.schema';
import { WorkspaceVisibility } from '@/types/workspace';

// ua: кастомний хук для ініціалізації та валідації форми створення воркспейсу
export const useWorkspaceForm = () => {
  return useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      visibility: WorkspaceVisibility.PRIVATE, // ua: по дефолту
    },
  });
};
