import api from '@/lib/axios';
import { WorkspaceCategory } from '@/types/document';

export interface CreateCategoryDTO {
  name: string;
  workspaceId: string; // ua: додаємо обов'язкове поле зв'язку з воркспейсом
}

export interface CategoryActionResponse {
  success: boolean;
  data: WorkspaceCategory;
}

export const categoryService = {
  // ua: створення нової категорії (папки) всередині вибраного воркспейсу
  createCategory: async (
    workspaceId: string,
    name: string,
  ): Promise<WorkspaceCategory> => {
    // ua: Робимо прямий POST запит до /categories, передаючи параметри в тілі (body) DTO
    const { data } = await api.post<CategoryActionResponse>('/categories', {
      name,
      workspaceId,
    });

    const res = data as CategoryActionResponse | null;
    if (res && typeof res === 'object' && res.success === true && res.data) {
      return res.data;
    }

    throw new Error('Invalid response structure during category creation');
  },

  // ua: повне каскадне видалення папки та всього її вмісту за ID (Статус 204)
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
  },
};
