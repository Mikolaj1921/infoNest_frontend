// ai tests - modal provider

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, cleanup } from '@testing-library/react';

import { ModalProvider } from './ModalProvider';

// ua: моки всіх модальних компонентів
vi.mock('@/components/modals/CreateFolderModal', () => ({
  CreateFolderModal: () => <div data-testid="create-folder-modal" />,
}));

vi.mock('@/components/modals/EditCategoryModal', () => ({
  EditCategoryModal: () => <div data-testid="edit-category-modal" />,
}));

vi.mock('@/components/modals/DeleteCategoryConfirmModal', () => ({
  DeleteCategoryConfirmModal: () => <div data-testid="delete-category-modal" />,
}));

vi.mock('@/components/modals/CreateDocumentModal', () => ({
  CreateDocumentModal: () => <div data-testid="create-document-modal" />,
}));

vi.mock('@/components/modals/DeleteDocumentConfirmModal', () => ({
  DeleteDocumentConfirmModal: () => <div data-testid="delete-document-modal" />,
}));

vi.mock('@/components/modals/RevisionHistorySidebar', () => ({
  RevisionHistorySidebar: () => <div data-testid="revision-history-modal" />,
}));

vi.mock('@/components/modals/CreateTaskModal', () => ({
  CreateTaskModal: () => <div data-testid="create-task-modal" />,
}));

vi.mock('@/components/modals/EditTaskModal', () => ({
  EditTaskModal: () => <div data-testid="edit-task-modal" />,
}));

vi.mock('@/components/modals/CreateTaskColumnModal', () => ({
  CreateTaskColumnModal: () => <div data-testid="create-task-column-modal" />,
}));

vi.mock('@/components/modals/EditTaskColumnModal', () => ({
  EditTaskColumnModal: () => <div data-testid="edit-task-column-modal" />,
}));

vi.mock('@/components/modals/DeleteTaskConfirmationModal', () => ({
  DeleteTaskConfirmationModal: () => <div data-testid="delete-task-modal" />,
}));

vi.mock('@/components/modals/EditWorkspaceModal', () => ({
  EditWorkspaceModal: () => <div data-testid="edit-workspace-modal" />,
}));

vi.mock('@/components/modals/DeleteWorkspaceConfirmModal', () => ({
  DeleteWorkspaceConfirmModal: () => (
    <div data-testid="delete-workspace-modal" />
  ),
}));

describe('ModalProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // 1. Початковий рендеринг
  it('1. Повинен не рендерити модалки до завершення монтування', () => {
    const { container } = render(<ModalProvider />);

    expect(container.firstChild).toBeNull();
    expect(screen.queryByTestId('create-folder-modal')).toBeNull();
    expect(screen.queryByTestId('create-document-modal')).toBeNull();
  });

  // 2. Рендеринг після виконання таймера
  it('2. Повинен відобразити всі модалки після виконання таймера', () => {
    render(<ModalProvider />);

    act(() => {
      vi.runOnlyPendingTimers();
    });

    const expectedModals = [
      'create-folder-modal',
      'delete-category-modal',
      'edit-category-modal',
      'create-document-modal',
      'delete-document-modal',
      'revision-history-modal',
      'create-task-modal',
      'edit-task-modal',
      'create-task-column-modal',
      'edit-task-column-modal',
      'delete-task-modal',
      'edit-workspace-modal',
      'delete-workspace-modal',
    ];

    expectedModals.forEach((modalTestId) => {
      expect(screen.getByTestId(modalTestId)).toBeTruthy();
    });

    expect(screen.getAllByTestId(/-modal$/)).toHaveLength(13);
  });

  // 3. Очищення таймера
  it('3. Повинен очищати таймер під час демонтування компонента', () => {
    const { unmount } = render(<ModalProvider />);

    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  // 4. Не повинен відображати модалки після демонтування
  it('4. Не повинен виконувати відкладений рендеринг після демонтування', () => {
    const { container, unmount } = render(<ModalProvider />);

    unmount();

    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(container.firstChild).toBeNull();
  });
});
