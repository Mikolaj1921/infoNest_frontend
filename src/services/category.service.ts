// ua: сервіс для роботи з категоріями (папками) всередині воркспейсу

import api from '@/lib/axios';
import { WorkspaceCategory } from '@/types/document';

export interface CreateCategoryDTO {
  name: string;
}

export interface CategoryActionResponse {
  success: boolean;
  data: WorkspaceCategory;
}

export const categoryService = {
  // ua: створення нової категорії (папки) всередині воркспейсу
  createCategory: async (
    workspaceId: string,
    dto: CreateCategoryDTO,
  ): Promise<WorkspaceCategory> => {
    const { data } = await api.post<CategoryActionResponse>(
      `/workspaces/${workspaceId}/categories`,
      dto,
    );

    const res = data as CategoryActionResponse | null;
    if (res && typeof res === 'object' && res.success === true && res.data) {
      return res.data;
    }

    throw new Error('Invalid response structure during category creation');
  },

  // ua: повне каскад видалення папки i вмісту за id
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
  },
};
