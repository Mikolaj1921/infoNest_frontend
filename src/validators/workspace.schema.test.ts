// ua: тестування Zod-схеми для створення воркспейсу (ai test)

import { describe, test, expect } from 'vitest';
import { createWorkspaceSchema } from './workspace.schema';
import { WorkspaceVisibility } from '@/types/workspace';

describe('Validators: Workspace Zod Schema', () => {
  test('1. Має успішно валідувати правильні дані форми створення воркспейсу', () => {
    const validData = {
      name: 'My New Brain',
      visibility: WorkspaceVisibility.PRIVATE,
    };

    const result = createWorkspaceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  test('2. Має блокувати створення, якщо назва коротша за 3 символи', () => {
    const invalidData = {
      name: 'IN', // ua: закоротка назва
      visibility: WorkspaceVisibility.PRIVATE,
    };

    const result = createWorkspaceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Workspace name must be at least 3 characters',
      );
    }
  });

  test('3. Має блокувати створення, якщо назва довша за 50 символів', () => {
    const longName = 'A'.repeat(51);
    const invalidData = {
      name: longName,
      visibility: WorkspaceVisibility.PUBLIC,
    };

    const result = createWorkspaceSchema.safeParse(invalidData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        'Workspace name is too long (max 50)',
      );
    }
  });
});
