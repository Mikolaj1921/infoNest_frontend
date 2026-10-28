import api from '@/lib/axios';
import { WorkspaceCategory } from '@/types/document';

export interface CreateCategoryDTO {
  name: string;
  workspaceId: string; // ua: додаємо обов'язкове поле зв'язку з воркспейсом
}

// ua: DTO для оновлення назви категорії
export interface UpdateCategoryDTO {
  name: string;
}

export interface CategoryActionResponse {
  success: boolean;
  data: WorkspaceCategory | { category: WorkspaceCategory };
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

    const res = data;

    if (res?.success && res.data) {
      const categoryData = res.data;

      if ('category' in categoryData) {
        return categoryData.category;
      }

      return categoryData;
    }

    throw new Error('Invalid response structure during category creation');
  },

  // ua: оновлення назви категорії
  updateCategory: async (
    categoryId: string,
    dto: UpdateCategoryDTO,
  ): Promise<WorkspaceCategory> => {
    const { data } = await api.patch<CategoryActionResponse>(
      `/categories/${categoryId}`,
      dto,
    );

    const res = data;

    if (res?.success && res.data) {
      const categoryData = res.data;

      if ('category' in categoryData) {
        return categoryData.category;
      }

      return categoryData;
    }

    throw new Error('Invalid response structure during category update');
  },

  // ua: повне каскадне видалення папки та всього її вмісту за ID (Статус 204)
  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/categories/${categoryId}`);
  },
};
