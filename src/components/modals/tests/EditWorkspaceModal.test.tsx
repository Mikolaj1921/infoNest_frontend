// ai tests - editworkspace modal component

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { EditWorkspaceModal } from '../EditWorkspaceModal';

const mocks = vi.hoisted(() => ({
  onClose: vi.fn(),
  updateWorkspace: vi.fn(),
  isOpen: true,
  type: 'editWorkspace',
  workspaceId: 'workspace_test_1' as string | undefined,
  workspaceName: 'Original Workspace',
  isPending: false,
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    isOpen: mocks.isOpen,
    onClose: mocks.onClose,
    type: mocks.type,
    data: {
      workspaceId: mocks.workspaceId,
      workspaceName: mocks.workspaceName,
    },
  }),
}));

vi.mock('@/features/workspaces/hooks/use-workspace-mutations', () => ({
  useUpdateWorkspace: () => ({
    mutateAsync: mocks.updateWorkspace,
    isPending: mocks.isPending,
  }),
}));

const renderEditWorkspaceModal = () => render(<EditWorkspaceModal />);

describe('EditWorkspaceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.isOpen = true;
    mocks.type = 'editWorkspace';
    mocks.workspaceId = 'workspace_test_1';
    mocks.workspaceName = 'Original Workspace';
    mocks.isPending = false;

    mocks.updateWorkspace.mockResolvedValue({
      id: 'workspace_test_1',
      name: 'Updated Workspace',
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // 1. Rendering
  describe('1. Rendering', () => {
    test('1.1. Повинен відображати модальне вікно редагування workspace', () => {
      renderEditWorkspaceModal();

      expect(screen.getByText('Rename Workspace')).toBeTruthy();
    });

    test('1.2. Повинен відображати опис модального вікна', () => {
      renderEditWorkspaceModal();

      expect(
        screen.getByText('Enter a new name for your workspace.'),
      ).toBeTruthy();
    });

    test('1.3. Повинен відображати поточну назву workspace в input', () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name') as HTMLInputElement;

      expect(input.value).toBe('Original Workspace');
    });

    test('1.4. Повинен відображати label для поля введення', () => {
      renderEditWorkspaceModal();

      expect(screen.getByText('Workspace name')).toBeTruthy();
    });

    test('1.5. Повинен відображати кнопки Cancel та Save changes', () => {
      renderEditWorkspaceModal();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy();
    });

    test('1.6. Повинен встановлювати максимальну довжину назви 100 символів', () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      expect(input.getAttribute('maxLength')).toBe('100');
    });

    test('1.7. Повинен приховувати модальне вікно, якщо воно закрите', () => {
      mocks.isOpen = false;

      renderEditWorkspaceModal();

      expect(screen.queryByText('Rename Workspace')).toBeNull();
    });

    test('1.8. Повинен приховувати модальне вікно, якщо відкритий інший тип модального вікна', () => {
      mocks.type = 'deleteWorkspace';

      renderEditWorkspaceModal();

      expect(screen.queryByText('Rename Workspace')).toBeNull();
    });
  });

  // 2. Input behavior
  describe('2. Input behavior', () => {
    test('2.1. Повинен дозволяти змінювати назву workspace', () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name') as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: 'New Workspace' },
      });

      expect(input.value).toBe('New Workspace');
    });

    test('2.2. Повинен дозволяти вводити порожнє значення', () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name') as HTMLInputElement;

      fireEvent.change(input, {
        target: { value: '' },
      });

      expect(input.value).toBe('');
    });

    test('2.3. Повинен відображати порожнє значення, якщо workspaceName відсутній', () => {
      mocks.workspaceName = undefined as unknown as string;

      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name') as HTMLInputElement;

      expect(input.value).toBe('');
    });

    test('2.4. Повинен блокувати кнопку збереження, якщо назва порожня', () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

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
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

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
      renderEditWorkspaceModal();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('3.2. Повинен закривати модальне вікно після натискання на backdrop', () => {
      const { container } = renderEditWorkspaceModal();

      const backdrop = container.firstChild as HTMLElement;

      fireEvent.mouseDown(backdrop);

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('3.3. Не повинен закривати модальне вікно після натискання всередині нього', () => {
      renderEditWorkspaceModal();

      fireEvent.mouseDown(screen.getByText('Rename Workspace'));

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 4. Workspace update
  describe('4. Workspace update', () => {
    test('4.1. Повинен викликати updateWorkspace з новою назвою', async () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: 'Updated Workspace' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateWorkspace).toHaveBeenCalledWith({
          workspaceId: 'workspace_test_1',
          dto: {
            name: 'Updated Workspace',
          },
        });
      });
    });

    test('4.2. Повинен обрізати пробіли на початку та в кінці назви', async () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: '   Updated Workspace   ' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateWorkspace).toHaveBeenCalledWith({
          workspaceId: 'workspace_test_1',
          dto: {
            name: 'Updated Workspace',
          },
        });
      });
    });

    test('4.3. Повинен закривати модальне вікно після успішного перейменування', async () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: 'Updated Workspace' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('4.4. Не повинен викликати updateWorkspace, якщо назва не змінилася', async () => {
      renderEditWorkspaceModal();

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.updateWorkspace).not.toHaveBeenCalled();
    });

    test('4.5. Повинен закривати модальне вікно, якщо нова назва після trim збігається з поточною', async () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: '  Original Workspace  ' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.updateWorkspace).not.toHaveBeenCalled();
    });

    test('4.6. Не повинен викликати updateWorkspace, якщо workspaceId відсутній', async () => {
      mocks.workspaceId = undefined;

      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: 'Updated Workspace' },
      });

      fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

      await waitFor(() => {
        expect(mocks.updateWorkspace).not.toHaveBeenCalled();
      });

      expect(mocks.onClose).not.toHaveBeenCalled();
    });

    test('4.7. Не повинен зберігати порожню назву', async () => {
      renderEditWorkspaceModal();

      const input = screen.getByLabelText('Workspace name');

      fireEvent.change(input, {
        target: { value: '   ' },
      });

      const form = input.closest('form') as HTMLFormElement;

      fireEvent.submit(form);

      await waitFor(() => {
        expect(mocks.updateWorkspace).not.toHaveBeenCalled();
      });

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 5. Pending state
  describe('5. Pending state', () => {
    test('5.1. Повинен відображати Saving... під час збереження', () => {
      mocks.isPending = true;

      renderEditWorkspaceModal();

      expect(screen.getByText('Saving...')).toBeTruthy();
    });

    test('5.2. Повинен блокувати поле введення під час збереження', () => {
      mocks.isPending = true;

      renderEditWorkspaceModal();

      expect(
        (screen.getByLabelText('Workspace name') as HTMLInputElement).disabled,
      ).toBe(true);
    });

    test('5.3. Повинен блокувати кнопки Cancel та Save changes під час збереження', () => {
      mocks.isPending = true;

      renderEditWorkspaceModal();

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

      const { container } = renderEditWorkspaceModal();

      const backdrop = container.firstChild as HTMLElement;

      fireEvent.mouseDown(backdrop);

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // 6. Error handling
  describe('6. Error handling', () => {
    test('6.1. Повинен обробляти помилку під час перейменування', async () => {
      const error = new Error('Update workspace failed');

      mocks.updateWorkspace.mockRejectedValue(error);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderEditWorkspaceModal();

        const input = screen.getByLabelText('Workspace name');

        fireEvent.change(input, {
          target: { value: 'Updated Workspace' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(error);
        });

        expect(mocks.updateWorkspace).toHaveBeenCalledTimes(1);
        expect(mocks.onClose).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    test('6.2. Не повинен закривати модальне вікно після невдалого перейменування', async () => {
      mocks.updateWorkspace.mockRejectedValue(new Error('Update failed'));

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      try {
        renderEditWorkspaceModal();

        const input = screen.getByLabelText('Workspace name');

        fireEvent.change(input, {
          target: { value: 'Updated Workspace' },
        });

        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

        await waitFor(() => {
          expect(mocks.updateWorkspace).toHaveBeenCalledTimes(1);
        });

        expect(mocks.onClose).not.toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });
  });
});
