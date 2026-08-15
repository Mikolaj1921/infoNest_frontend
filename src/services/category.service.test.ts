// ua: тест для сервісу категорій - ai tests

import { describe, it, expect, vi, beforeEach } from 'vitest';
import api from '@/lib/axios';
import { categoryService } from './category.service';

// ua: мок налаштований екземпляр axios
vi.mock('@/lib/axios', () => ({
  default: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('categoryService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createCategory', () => {
    it('має успішно створити категорію та повернути об’єкт даних при коді 201', async () => {
      const mockCategory = {
        id: 'cat-123',
        name: 'Нова Папка',
        workspaceId: 'ws-999',
        documents: [],
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      };

      // Імітуємо успішну відповідь від API
      vi.mocked(api.post).mockResolvedValueOnce({
        status: 201,
        data: {
          success: true,
          data: mockCategory,
        },
      });

      const result = await categoryService.createCategory('ws-999', {
        name: 'Нова Папка',
      });

      expect(api.post).toHaveBeenCalledWith('/workspaces/ws-999/categories', {
        name: 'Нова Папка',
      });
      expect(result).toEqual(mockCategory);
    });

    it('має викинути помилку, якщо success має значення false або структура невалідна', async () => {
      vi.mocked(api.post).mockResolvedValueOnce({
        status: 201,
        data: {
          success: false,
          data: null,
        },
      });

      await expect(
        categoryService.createCategory('ws-999', { name: 'Зламана Папка' }),
      ).rejects.toThrow('Invalid response structure during category creation');
    });
  });

  describe('deleteCategory', () => {
    it('має виконати HTTP DELETE запит для видалення папки', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({ status: 204 });

      await categoryService.deleteCategory('cat-123');

      expect(api.delete).toHaveBeenCalledWith('/categories/cat-123');
    });
  });
});
