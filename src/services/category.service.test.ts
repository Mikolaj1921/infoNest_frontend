import { describe, it, expect, vi, beforeEach } from 'vitest';

import api from '@/lib/axios';
import { categoryService } from './category.service';

import type { WorkspaceCategory } from '@/types/document';

// ua: мок налаштованого екземпляра Axios
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('categoryService', () => {
  const mockCategory = {
    id: 'cat-123',
    name: 'Нова Папка',
    workspaceId: 'ws-999',
    documents: [],
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  } as unknown as WorkspaceCategory;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // CREATE CATEGORY
  // ==========================================

  describe('createCategory', () => {
    // 1. Успішне створення категорії
    it('1. Повинен створювати категорію та повертати об’єкт даних', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: mockCategory,
        },
      } as never);

      const result = await categoryService.createCategory(
        'ws-999',
        'Нова Папка',
      );

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/categories', {
        name: 'Нова Папка',
        workspaceId: 'ws-999',
      });
      expect(result).toEqual(mockCategory);
    });

    // 2. Повернення категорії з вкладеної структури
    it('2. Повинен повертати category, якщо API використовує вкладену структуру', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            category: mockCategory,
          },
        },
      } as never);

      const result = await categoryService.createCategory(
        'ws-999',
        'Нова Папка',
      );

      expect(result).toEqual(mockCategory);
    });

    // 3. Некоректна відповідь API
    it('3. Повинен викидати помилку, якщо success має значення false', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      await expect(
        categoryService.createCategory('ws-999', 'Зламана Папка'),
      ).rejects.toThrow('Invalid response structure during category creation');
    });

    // 4. Відсутність data у відповіді
    it('4. Повинен викидати помилку, якщо API не повертає data', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      await expect(
        categoryService.createCategory('ws-999', 'Папка'),
      ).rejects.toThrow('Invalid response structure during category creation');
    });

    // 5. HTTP-помилка
    it('5. Повинен передавати помилку API під час створення категорії', async () => {
      const mockError = new Error('Category creation failed');

      vi.mocked(api.post).mockRejectedValueOnce(mockError);

      await expect(
        categoryService.createCategory('ws-999', 'Папка'),
      ).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // UPDATE CATEGORY
  // ==========================================

  describe('updateCategory', () => {
    const updateDTO = {
      name: 'Оновлена Папка',
    };

    const updatedCategory = {
      ...mockCategory,
      name: 'Оновлена Папка',
    };

    // 6. Успішне оновлення категорії
    it('6. Повинен оновлювати назву категорії та повертати оновлені дані', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedCategory,
        },
      } as never);

      const result = await categoryService.updateCategory('cat-123', updateDTO);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/categories/cat-123', updateDTO);
      expect(result).toEqual(updatedCategory);
    });

    // 7. Вкладена структура відповіді
    it('7. Повинен повертати category з вкладеної відповіді API', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            category: updatedCategory,
          },
        },
      } as never);

      const result = await categoryService.updateCategory('cat-123', updateDTO);

      expect(result).toEqual(updatedCategory);
    });

    // 8. Некоректна відповідь API
    it('8. Повинен викидати помилку, якщо success має значення false', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: false,
          data: null,
        },
      } as never);

      await expect(
        categoryService.updateCategory('cat-123', updateDTO),
      ).rejects.toThrow('Invalid response structure during category update');
    });

    // 9. Відсутність data
    it('9. Повинен викидати помилку, якщо API не повертає data', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      } as never);

      await expect(
        categoryService.updateCategory('cat-123', updateDTO),
      ).rejects.toThrow('Invalid response structure during category update');
    });

    // 10. HTTP-помилка
    it('10. Повинен передавати помилку API під час оновлення категорії', async () => {
      const mockError = new Error('Category update failed');

      vi.mocked(api.patch).mockRejectedValueOnce(mockError);

      await expect(
        categoryService.updateCategory('cat-123', updateDTO),
      ).rejects.toBe(mockError);
    });
  });

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  describe('deleteCategory', () => {
    // 11. Успішне видалення
    it('11. Повинен виконувати DELETE-запит для видалення категорії', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({
        status: 204,
      } as never);

      const result = await categoryService.deleteCategory('cat-123');

      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith('/categories/cat-123');
      expect(result).toBeUndefined();
    });

    // 12. HTTP-помилка
    it('12. Повинен передавати помилку API під час видалення категорії', async () => {
      const mockError = new Error('Category deletion failed');

      vi.mocked(api.delete).mockRejectedValueOnce(mockError);

      await expect(categoryService.deleteCategory('cat-123')).rejects.toBe(
        mockError,
      );
    });
  });
});
