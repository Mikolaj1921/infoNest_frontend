// tests with ai - delworkspace modal component

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { DeleteWorkspaceConfirmModal } from '../DeleteWorkspaceConfirmModal';

// ua: моки зовнішніх залежностей
const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  onClose: vi.fn(),
  deleteWorkspace: vi.fn(),
  pathname: '/workspaces',
  isOpen: true,
  type: 'deleteWorkspace',
  workspaceId: 'ws_test_1' as string | undefined,
  workspaceName: 'Project Workspace',
  isPending: false,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
  usePathname: () => mocks.pathname,
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
  useDeleteWorkspace: () => ({
    mutateAsync: mocks.deleteWorkspace,
    isPending: mocks.isPending,
  }),
}));

// ua: допоміжна функція для рендерингу модалки
const renderDeleteWorkspaceModal = () => {
  return render(<DeleteWorkspaceConfirmModal />);
};

describe('DeleteWorkspaceConfirmModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // ua: стандартний стан модалки
    mocks.pathname = '/workspaces';
    mocks.isOpen = true;
    mocks.type = 'deleteWorkspace';
    mocks.workspaceId = 'ws_test_1';
    mocks.workspaceName = 'Project Workspace';
    mocks.isPending = false;

    mocks.deleteWorkspace.mockResolvedValue({
      message: 'Workspace deleted successfully',
    });
  });

  // =====================================================
  // 1. BASIC RENDERING
  // =====================================================

  describe('1. Basic rendering', () => {
    test('1.1. Повинен відображати модалку видалення workspace', () => {
      renderDeleteWorkspaceModal();

      expect(screen.getByText('Delete Workspace?')).toBeTruthy();
      expect(screen.getByText('Critical Warning:')).toBeTruthy();
      expect(screen.getByText('Cancel')).toBeTruthy();
      expect(screen.getByText('Delete Permanently')).toBeTruthy();
    });

    test('1.2. Повинен відображати назву workspace', () => {
      renderDeleteWorkspaceModal();

      expect(
        screen.getByText('Project Workspace', { exact: false }),
      ).toBeTruthy();
    });

    test('1.3. Повинен відображати попередження про незворотність видалення', () => {
      renderDeleteWorkspaceModal();

      expect(
        screen.getByText(/All documents, categories, tasks, whiteboard data/i),
      ).toBeTruthy();

      expect(screen.getByText(/This action cannot be undone/i)).toBeTruthy();
    });

    test('1.4. Не повинен відображати модалку, якщо вона закрита', () => {
      mocks.isOpen = false;

      renderDeleteWorkspaceModal();

      expect(screen.queryByText('Delete Workspace?')).toBeNull();
      expect(screen.queryByText('Delete Permanently')).toBeNull();
    });

    test('1.5. Не повинен відображати модалку, якщо відкритий інший тип модалки', () => {
      mocks.type = 'createWorkspace';

      renderDeleteWorkspaceModal();

      expect(screen.queryByText('Delete Workspace?')).toBeNull();
    });
  });

  // =====================================================
  // 2. CANCEL AND CLOSING
  // =====================================================

  describe('2. Cancel and closing', () => {
    test('2.1. Повинен закривати модалку після натискання Cancel', () => {
      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Cancel'));

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('2.2. Повинен закривати модалку після кліку на фон', () => {
      const { container } = renderDeleteWorkspaceModal();

      const overlay = container.firstChild as HTMLElement;

      fireEvent.mouseDown(overlay);

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('2.3. Не повинен закривати модалку після кліку всередині її вмісту', () => {
      renderDeleteWorkspaceModal();

      fireEvent.mouseDown(screen.getByText('Delete Workspace?'));

      expect(mocks.onClose).not.toHaveBeenCalled();
    });

    test('2.4. Не повинен закривати модалку після кліку на фон, якщо видалення виконується', () => {
      mocks.isPending = true;

      const { container } = renderDeleteWorkspaceModal();

      const overlay = container.firstChild as HTMLElement;

      fireEvent.mouseDown(overlay);

      expect(mocks.onClose).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // 3. WORKSPACE DELETION
  // =====================================================

  describe('3. Workspace deletion', () => {
    test('3.1. Повинен викликати видалення з правильним workspace ID', async () => {
      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.deleteWorkspace).toHaveBeenCalledTimes(1);
        expect(mocks.deleteWorkspace).toHaveBeenCalledWith('ws_test_1');
      });
    });

    test('3.2. Повинен закривати модалку після успішного видалення', async () => {
      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });
    });

    test('3.3. Не повинен викликати видалення, якщо workspace ID відсутній', async () => {
      mocks.workspaceId = undefined;

      renderDeleteWorkspaceModal();

      const deleteButton = screen
        .getByText('Delete Permanently')
        .closest('button') as HTMLButtonElement;

      expect(deleteButton.disabled).toBe(true);

      fireEvent.click(deleteButton);

      expect(mocks.deleteWorkspace).not.toHaveBeenCalled();
      expect(mocks.onClose).not.toHaveBeenCalled();
    });

    test('3.4. Не повинен закривати модалку до завершення видалення', async () => {
      let resolveDeletion: (value: unknown) => void = () => {};

      mocks.deleteWorkspace.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDeletion = resolve;
          }),
      );

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.deleteWorkspace).toHaveBeenCalledTimes(1);
      });

      expect(mocks.onClose).not.toHaveBeenCalled();

      resolveDeletion({
        message: 'Workspace deleted successfully',
      });

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });
    });
  });

  // =====================================================
  // 4. NAVIGATION AFTER DELETION
  // =====================================================

  describe('4. Navigation after deletion', () => {
    test('4.1. Повинен повертати до списку workspace, якщо видалений workspace відкритий', async () => {
      mocks.pathname = '/workspaces/ws_test_1';

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.push).toHaveBeenCalledWith('/workspaces');
      });
    });

    test('4.2. Повинен повертати до списку workspace з вкладеної сторінки видаленого workspace', async () => {
      mocks.pathname = '/workspaces/ws_test_1/whiteboard';

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.push).toHaveBeenCalledWith('/workspaces');
      });
    });

    test('4.3. Не повинен переходити на іншу сторінку, якщо відкритий інший workspace', async () => {
      mocks.pathname = '/workspaces/ws_test_2';

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.push).not.toHaveBeenCalled();
    });

    test('4.4. Не повинен переходити на список workspace, якщо користувач знаходиться поза сторінкою видаленого workspace', async () => {
      mocks.pathname = '/profile';

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.push).not.toHaveBeenCalled();
    });

    test('4.5. Не повинен помилково переходити, якщо ID іншого workspace починається з ID видаленого', async () => {
      mocks.pathname = '/workspaces/ws_test_10';

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(mocks.onClose).toHaveBeenCalledTimes(1);
      });

      expect(mocks.push).not.toHaveBeenCalled();
    });
  });

  // =====================================================
  // 5. PENDING STATE
  // =====================================================

  describe('5. Pending state', () => {
    test('5.1. Повинен відображати текст Deleting під час видалення', () => {
      mocks.isPending = true;

      renderDeleteWorkspaceModal();

      expect(screen.getByText('Deleting...')).toBeTruthy();
    });

    test('5.2. Повинен блокувати кнопку підтвердження під час видалення', () => {
      mocks.isPending = true;

      renderDeleteWorkspaceModal();

      const deleteButton = screen
        .getByText('Deleting...')
        .closest('button') as HTMLButtonElement;

      expect(deleteButton.disabled).toBe(true);
    });

    test('5.3. Повинен блокувати кнопку Cancel під час видалення', () => {
      mocks.isPending = true;

      renderDeleteWorkspaceModal();

      const cancelButton = screen
        .getByText('Cancel')
        .closest('button') as HTMLButtonElement;

      expect(cancelButton.disabled).toBe(true);
    });
  });

  // =====================================================
  // 6. ERROR HANDLING
  // =====================================================

  describe('6. Error handling', () => {
    test('6.1. Повинен обробляти помилку під час видалення', async () => {
      const error = new Error('Workspace deletion failed');

      mocks.deleteWorkspace.mockRejectedValue(error);

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(error);
      });

      consoleErrorSpy.mockRestore();
    });

    test('6.2. Не повинен закривати модалку після помилки видалення', async () => {
      mocks.deleteWorkspace.mockRejectedValue(
        new Error('Workspace deletion failed'),
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      expect(mocks.onClose).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    test('6.3. Не повинен переходити на список workspace після помилки видалення', async () => {
      mocks.pathname = '/workspaces/ws_test_1';

      mocks.deleteWorkspace.mockRejectedValue(
        new Error('Workspace deletion failed'),
      );

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      renderDeleteWorkspaceModal();

      fireEvent.click(screen.getByText('Delete Permanently'));

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      expect(mocks.push).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });
});
