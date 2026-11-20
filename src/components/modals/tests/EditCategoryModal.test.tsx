import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { EditCategoryModal } from './EditCategoryModal';

const mocks = vi.hoisted(() => ({
  onClose: vi.fn(),
  updateCategory: vi.fn(),
  isOpen: true,
  type: 'editCategory',
  categoryId: 'category_test_1' as string | undefined,
  categoryName: 'Original Category',
  isPending: false,
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    isOpen: mocks.isOpen,
    onClose: mocks.onClose,
    type: mocks.type,
    data: {
      categoryId: mocks.categoryId,
      categoryName: mocks.categoryName,
    },
  }),
}));

vi.mock('@/features/documents/hooks/use-category-mutations', () => ({
  useUpdateCategory: () => ({
    mutateAsync: mocks.updateCategory,
    isPending: mocks.isPending,
  }),
}));

const renderEditCategoryModal = () => render(<EditCategoryModal />);

describe('EditCategoryModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.isOpen = true;
    mocks.type = 'editCategory';
    mocks.categoryId = 'category_test_1';
    mocks.categoryName = 'Original Category';
    mocks.isPending = false;

    mocks.updateCategory.mockResolvedValue({
      id: 'category_test_1',
      name: 'Updated Category',
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // 1. Rendering
  describe('1. Rendering', () => {
    test('1.1. Повинен відображати модальне вікно редагування категорії', () => {
      renderEditCategoryModal();

      expect(screen.getByText('Rename Category')).toBeTruthy();
    });

    test('1.2. Повинен відображати опис модального вікна', () => {
      renderEditCategoryModal();

      expect(screen.getByText('Enter a new name for the folder.')).toBeTruthy();
    });

    test('1.3. Повинен відображати поточну назву категорії в input', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name') as HTMLInputElement;

      expect(input.value).toBe('Original Category');
    });

    test('1.4. Повинен відображати label для поля введення', () => {
      renderEditCategoryModal();

      expect(screen.getByText('Folder name')).toBeTruthy();
    });

    test('1.5. Повинен відображати кнопки Cancel та Save changes', () => {
      renderEditCategoryModal();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
    });

    test('1.6. Повинен встановлювати максимальну довжину назви 100 символів', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      expect(input.getAttribute('maxLength')).toBe('100');
    });

    test('1.7. Повинен приховувати модальне вікно, якщо воно закрите', () => {
      mocks.isOpen = false;

      renderEditCategoryModal();

      expect(screen.queryByText('Rename Category')).toBeNull();
    });

    test('1.8. Повинен приховувати модальне вікно, якщо відкритий інший тип модального вікна', () => {
      mocks.type = 'deleteWorkspace';

      renderEditCategoryModal();

      expect(screen.queryByText('Rename Category')).toBeNull();
    });
  });

  // 2. Input behavior
  describe('2. Input behavior', () => {
    test('2.1. Повинен дозволяти змінювати назву категорії', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name') as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: 'New Category' },
      });

      expect(input.value).toBe('New Category');
    });

    test('2.2. Повинен дозволяти вводити порожнє значення', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name') as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: '' },
      });

      expect(input.value).toBe('');
    });

    test('2.3. Повинен відображати порожнє значення, якщо categoryName відсутній', () => {
      mocks.categoryName = undefined as unknown as string;

      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name') as HTMLInputElement;

      expect(input.value).toBe('');
    });

    test('2.4. Повинен блокувати кнопку збереження, якщо назва порожня', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: '' },
      });

      expect(
        (
          screen.getByRole('button', {
            name: 'Save changes',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    test('2.5. Повинен блокувати кнопку збереження, якщо назва містить лише пробіли', () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: '   ' },
      });

      expect(
        (
          screen.getByRole('button', {
            name: 'Save changes',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });
  });

  // 3. Closing modal
  describe('3. Closing modal', () => {
    test('3.1. Повинен закривати модальне вікно після натискання Cancel', () => {
      renderEditCategoryModal();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('3.2. Повинен закривати модальне вікно після натискання на backdrop', () => {
      const { container } = renderEditCategoryModal();

      const backdrop = container.firstChild as HTMLElement;

      fireEvent.mouseDown(backdrop);

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('3.3. Не повинен закривати модальне вікно після натискання всередині нього', () => {
      renderEditCategoryModal();

      fireEvent.mouseDown(screen.getByText('Rename Category'));

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 4. Category update
  describe('4. Category update', () => {
    test('4.1. Повинен викликати updateCategory з новою назвою', async () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: 'Updated Category' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateCategory).toHaveBeenCalledWith({
          categoryId: 'category_test_1',
          dto: {
            name: 'Updated Category',
          },
        });
      });
    });

    test('4.2. Повинен обрізати пробіли на початку та в кінці назви', async () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: '   Updated Category   ' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateCategory).toHaveBeenCalledWith({
          categoryId: 'category_test_1',
          dto: {
            name: 'Updated Category',
          },
        });
      });
    });

    test('4.3. Повинен закривати модальне вікно після успішного перейменування', async () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: 'Updated Category' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('4.4. Не повинен викликати updateCategory, якщо назва не змінилася', async () => {
      renderEditCategoryModal();

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.updateCategory).not.toHaveBeenCalled();
    });

    test('4.5. Повинен закривати модальне вікно, якщо нова назва після trim збігається з поточною', async () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: '  Original Category  ' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.updateCategory).not.toHaveBeenCalled();
    });

    test('4.6. Не повинен викликати updateCategory, якщо categoryId відсутній', async () => {
      mocks.categoryId = undefined;

      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: 'Updated Category' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateCategory).not.toHaveBeenCalled();
      });

      expect(mocks.onClose).not.toHaveBeenCalled();
    });

    test('4.7. Не повинен зберігати порожню назву', async () => {
      renderEditCategoryModal();

      const input = screen.getByLabelText('Folder name');

      fireEvent.change(input, {
        target: { value: '   ' },
      });

      const form = input.closest('form') as HTMLFormElement;

      fireEvent.submit(form);

      await waitFor(() => {
        expect(mocks.updateCategory).not.toHaveBeenCalled();
      });

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 5. Pending state
  describe('5. Pending state', () => {
    test('5.1. Повинен відображати Saving... під час збереження', () => {
      mocks.isPending = true;

      renderEditCategoryModal();

      expect(screen.getByText('Saving...')).toBeTruthy();
    });

    test('5.2. Повинен блокувати поле введення під час збереження', () => {
      mocks.isPending = true;

      renderEditCategoryModal();

      expect(
        (screen.getByLabelText('Folder name') as HTMLInputElement).disabled,
      ).toBe(true);
    });

    test('5.3. Повинен блокувати кнопки Cancel та Save changes під час збереження', () => {
      mocks.isPending = true;

      renderEditCategoryModal();

      expect(
        (
          screen.getByRole('button', {
            name: 'Cancel',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);

      expect(
        (
          screen.getByRole('button', {
            name: 'Saving...',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    test('5.4. Не повинен закривати модальне вікно через backdrop під час збереження', () => {
      mocks.isPending = true;

      const { container } = renderEditCategoryModal();

      const backdrop = container.firstChild as HTMLElement;

      fireEvent.mouseDown(backdrop);

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 6. Error handling
  describe('6. Error handling', () => {
    test('6.1. Повинен обробляти помилку під час перейменування', async () => {
      const error = new Error('Update category failed');

      mocks.updateCategory.mockRejectedValue(error);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderEditCategoryModal();

        const input = screen.getByLabelText('Folder name');

        fireEvent.change(input, {
          target: { value: 'Updated Category' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });

        expect(mocks.updateCategory).toHaveBeenCalledTimes(1);
        expect(mocks.onClose).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    test('6.2. Не повинен закривати модальне вікно після невдалого перейменування', async () => {
      mocks.updateCategory.mockRejectedValue(new Error('Update failed'));

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderEditCategoryModal();

        const input = screen.getByLabelText('Folder name');

        fireEvent.change(input, {
          target: { value: 'Updated Category' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => {
          expect(mocks.updateCategory).toHaveBeenCalledTimes(1);
        });

        expect(mocks.onClose).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
