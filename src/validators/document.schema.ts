import * as z from 'zod';

// createDocumentSchema
export const createDocumentSchema = z.object({
  title: z
    .string()
    .min(1, { message: 'Document title is required' })
    .max(50, { message: 'Title cannot exceed 50 characters' }),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
