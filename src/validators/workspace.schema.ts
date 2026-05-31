import { z } from 'zod';
import { WorkspaceVisibility } from '@/types/workspace';

// ua: Zod-схема для валідації полів форми створення воркспейсу
export const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(50, 'Workspace name is too long (max 50)'),
  visibility: z.nativeEnum(WorkspaceVisibility, {
    error: 'Visibility status is required',
  }),
});

// ua: екстракція типу для вхідних даних
export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
