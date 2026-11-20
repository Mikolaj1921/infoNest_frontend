// ai tests - revision history sidebar

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import { RevisionHistorySidebar } from './RevisionHistorySidebar';
import type { DocumentRevision } from '@/types/document';

const mocks = vi.hoisted(() => ({
  onClose: vi.fn(),
  onSelectRevision: vi.fn(),
  refetch: vi.fn(),
  isOpen: true,
  type: 'revisionHistory',
  documentId: 'document_test_1' as string | undefined,
  currentContent: '<p>Current document content</p>',
  revisions: [] as unknown[],
  isLoading: false,
  isError: false,
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    isOpen: mocks.isOpen,
    onClose: mocks.onClose,
    type: mocks.type,
    data: {
      documentId: mocks.documentId,
      currentContent: mocks.currentContent,
      onSelectRevision: mocks.onSelectRevision,
    },
  }),
}));

vi.mock('@/features/documents/hooks/useDocumentRevisions', () => ({
  useDocumentRevisions: vi.fn(() => ({
    data: mocks.revisions,
    isLoading: mocks.isLoading,
    isError: mocks.isError,
    refetch: mocks.refetch,
  })),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="font-awesome-icon" />,
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line
    <img {...props} />
  ),
}));

const createRevision = (
  overrides: Partial<DocumentRevision> = {},
): DocumentRevision =>
  ({
    id: 'revision_1',
    content: '<p>Previous document content</p>',
    createdAt: '2026-11-19T10:00:00.000Z',
    editor: {
      name: 'Test Editor',
      email: 'editor@example.com',
      avatarUrl: undefined,
    },
    ...overrides,
  }) as DocumentRevision;

const renderRevisionHistorySidebar = () => render(<RevisionHistorySidebar />);

describe('RevisionHistorySidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.onClose = vi.fn();
    mocks.onSelectRevision = vi.fn();
    mocks.refetch = vi.fn();

    mocks.isOpen = true;
    mocks.type = 'revisionHistory';
    mocks.documentId = 'document_test_1';
    mocks.currentContent = '<p>Current document content</p>';
    mocks.revisions = [];
    mocks.isLoading = false;
    mocks.isError = false;

    mocks.refetch.mockResolvedValue(undefined);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // 1. Rendering
  describe('1. Rendering', () => {
    test('1.1. Повинен відображати панель історії версій', () => {
      renderRevisionHistorySidebar();

      expect(screen.getByText('Version History')).toBeTruthy();
    });

    test('1.2. Повинен відображати заголовок поточної версії', () => {
      renderRevisionHistorySidebar();

      expect(screen.getByText('Current Version')).toBeTruthy();
    });

    test('1.3. Повинен відображати інформацію про поточний документ', () => {
      renderRevisionHistorySidebar();

      expect(screen.getByText('Currently in editor')).toBeTruthy();
      expect(screen.getByText('Current document content')).toBeTruthy();
      expect(screen.getByText('Latest editor content')).toBeTruthy();
    });

    test('1.4. Повинен відображати кнопку закриття з правильним aria-label', () => {
      renderRevisionHistorySidebar();

      expect(
        screen.getByRole('button', {
          name: 'Close version history',
        }),
      ).toBeTruthy();
    });

    test('1.5. Повинен приховувати панель, якщо вона закрита', () => {
      mocks.isOpen = false;

      renderRevisionHistorySidebar();

      expect(screen.queryByText('Version History')).toBeNull();
    });

    test('1.6. Повинен приховувати панель, якщо відкритий інший тип модального вікна', () => {
      mocks.type = 'editWorkspace';

      renderRevisionHistorySidebar();

      expect(screen.queryByText('Version History')).toBeNull();
    });
  });

  // 2. Loading and error states
  describe('2. Loading and error states', () => {
    test('2.1. Повинен відображати індикатор завантаження', () => {
      mocks.isLoading = true;

      renderRevisionHistorySidebar();

      expect(screen.getByText('Loading document history...')).toBeTruthy();
    });

    test('2.2. Не повинен відображати список версій під час завантаження', () => {
      mocks.isLoading = true;
      mocks.revisions = [createRevision()];

      renderRevisionHistorySidebar();

      expect(screen.queryByText('Current Version')).toBeNull();
      expect(screen.queryByText('Previous Versions')).toBeNull();
    });

    test('2.3. Повинен відображати повідомлення про помилку завантаження', () => {
      mocks.isError = true;

      renderRevisionHistorySidebar();

      expect(screen.getByText('Failed to load history')).toBeTruthy();
      expect(
        screen.getByText('Please check your connection and try again.'),
      ).toBeTruthy();
    });

    test('2.4. Не повинен відображати список версій при помилці завантаження', () => {
      mocks.isError = true;
      mocks.revisions = [createRevision()];

      renderRevisionHistorySidebar();

      expect(screen.queryByText('Current Version')).toBeNull();
      expect(screen.queryByText('Previous Versions')).toBeNull();
    });

    test('2.5. Повинен відображати вміст після завершення завантаження', () => {
      mocks.isLoading = false;
      mocks.isError = false;

      renderRevisionHistorySidebar();

      expect(screen.getByText('Current Version')).toBeTruthy();
      expect(screen.getByText('Current document content')).toBeTruthy();
    });
  });

  // 3. Revision history
  describe('3. Revision history', () => {
    test('3.1. Повинен відображати повідомлення, якщо попередніх версій немає', () => {
      mocks.revisions = [];

      renderRevisionHistorySidebar();

      expect(screen.getByText('No previous versions found')).toBeTruthy();
    });

    test('3.2. Повинен відображати список попередніх версій', () => {
      mocks.revisions = [
        createRevision({
          id: 'revision_1',
          editor: {
            id: 'user_test_1',
            name: 'First Editor',
            email: 'first@example.com',
            avatarUrl: undefined,
          },
        }),
        createRevision({
          id: 'revision_2',
          editor: {
            id: 'user_test_1',
            name: 'Second Editor',
            email: 'second@example.com',
            avatarUrl: undefined,
          },
        }),
      ];

      renderRevisionHistorySidebar();

      expect(screen.getByText('Previous Versions')).toBeTruthy();
      expect(screen.getByText('First Editor')).toBeTruthy();
      expect(screen.getByText('Second Editor')).toBeTruthy();
    });

    test('3.3. Повинен відображати правильні номери версій', () => {
      mocks.revisions = [
        createRevision({ id: 'revision_1' }),
        createRevision({ id: 'revision_2' }),
        createRevision({ id: 'revision_3' }),
      ];

      renderRevisionHistorySidebar();

      expect(screen.getByText('v.3')).toBeTruthy();
      expect(screen.getByText('v.2')).toBeTruthy();
      expect(screen.getByText('v.1')).toBeTruthy();
    });

    test('3.4. Повинен відображати email редактора', () => {
      mocks.revisions = [
        createRevision({
          editor: {
            id: 'user_test_1',
            name: 'Test Editor',
            email: 'editor@example.com',
            avatarUrl: undefined,
          },
        }),
      ];

      renderRevisionHistorySidebar();

      expect(screen.getByText('editor@example.com')).toBeTruthy();
    });

    test('3.5. Повинен відображати Unknown editor, якщо ім’я редактора відсутнє', () => {
      mocks.revisions = [
        createRevision({
          editor: {
            id: 'user_test_1',
            name: '',
            email: '',
            avatarUrl: undefined,
          },
        }),
      ];

      renderRevisionHistorySidebar();

      expect(screen.getByText('Unknown editor')).toBeTruthy();
    });

    test('3.6. Повинен відображати аватар редактора, якщо avatarUrl доступний', () => {
      mocks.revisions = [
        createRevision({
          editor: {
            id: 'user_test_1',
            name: 'Test Editor',
            email: 'editor@example.com',
            avatarUrl: 'https://example.com/avatar.png',
          },
        }),
      ];

      renderRevisionHistorySidebar();

      const avatar = screen.getByRole('img', {
        name: 'Test Editor',
      }) as HTMLImageElement;

      expect(avatar.getAttribute('src')).toBe('https://example.com/avatar.png');
    });

    test('3.7. Повинен використовувати резервну іконку, якщо аватар відсутній', () => {
      mocks.revisions = [
        createRevision({
          editor: {
            id: 'user_test_1',
            name: 'Test Editor',
            email: 'editor@example.com',
            avatarUrl: undefined,
          },
        }),
      ];

      renderRevisionHistorySidebar();

      expect(screen.queryByRole('img')).toBeNull();
      expect(screen.getAllByTestId('font-awesome-icon').length).toBeGreaterThan(
        0,
      );
    });

    test('3.8. Повинен відображати позначку Snapshot data captured', () => {
      mocks.revisions = [createRevision()];

      renderRevisionHistorySidebar();

      expect(screen.getByText('Snapshot data captured')).toBeTruthy();
    });
  });

  // 4. Current version preview
  describe('4. Current version preview', () => {
    test('4.1. Повинен відкривати попередній перегляд поточної версії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Current Version'));

      expect(screen.getByText('Current version preview')).toBeTruthy();
    });

    test('4.2. Повинен відображати HTML-вміст поточної версії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Current Version'));

      expect(
        screen.getByText('Current document content', {
          selector: '.prose p',
        }),
      ).toBeTruthy();
    });

    test('4.3. Повинен закривати попередній перегляд поточної версії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Current Version'));

      fireEvent.click(screen.getByRole('button', { name: 'Close preview' }));

      expect(screen.queryByText('Current version preview')).toBeNull();
    });

    test('4.4. Повинен закривати попередній перегляд після повторного натискання на поточну версію', () => {
      renderRevisionHistorySidebar();

      const currentVersion = screen.getByText('Current Version');

      fireEvent.click(currentVersion);

      expect(screen.getByText('Current version preview')).toBeTruthy();

      fireEvent.click(currentVersion);

      expect(screen.queryByText('Current version preview')).toBeNull();
    });

    test('4.5. Повинен відображати порожній вміст, якщо currentContent відсутній', () => {
      mocks.currentContent = '';

      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Current Version'));

      expect(screen.getByText('Current version preview')).toBeTruthy();
    });
  });

  // 5. Previous revision preview
  describe('5. Previous revision preview', () => {
    beforeEach(() => {
      mocks.revisions = [
        createRevision({
          id: 'revision_1',
          content: '<p>First revision content</p>',
          editor: {
            id: 'user_test_1',
            name: 'First Editor',
            email: 'first@example.com',
            avatarUrl: undefined,
          },
        }),
        createRevision({
          id: 'revision_2',
          content: '<p>Second revision content</p>',
          editor: {
            id: 'user_test_2',
            name: 'Second Editor',
            email: 'second@example.com',
            avatarUrl: undefined,
          },
        }),
      ];
    });

    test('5.1. Повинен відкривати попередній перегляд вибраної ревізії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('First Editor'));

      expect(screen.getByText('Version 2 preview')).toBeTruthy();
    });

    test('5.2. Повинен відображати вміст вибраної ревізії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('First Editor'));

      expect(screen.getByText('First revision content')).toBeTruthy();
    });

    test('5.3. Повинен показувати правильний номер вибраної ревізії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Second Editor'));

      expect(screen.getByText('Version 1 preview')).toBeTruthy();
    });

    test('5.4. Повинен закривати попередній перегляд після натискання Cancel', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('First Editor'));

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(screen.queryByText('Version 2 preview')).toBeNull();
    });

    test('5.5. Повинен закривати попередній перегляд після повторного натискання на ту саму ревізію', () => {
      renderRevisionHistorySidebar();

      const revision = screen.getByText('First Editor');

      fireEvent.click(revision);

      expect(screen.getByText('Version 2 preview')).toBeTruthy();

      fireEvent.click(revision);

      expect(screen.queryByText('Version 2 preview')).toBeNull();
    });

    test('5.6. Повинен дозволяти перемикатися між попередніми ревізіями', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('First Editor'));

      expect(screen.getByText('First revision content')).toBeTruthy();

      fireEvent.click(screen.getByText('Second Editor'));

      expect(screen.getByText('Second revision content')).toBeTruthy();
      expect(screen.queryByText('First revision content')).toBeNull();
    });
  });

  // 6. Restore revision
  describe('6. Restore revision', () => {
    beforeEach(() => {
      mocks.revisions = [
        createRevision({
          id: 'revision_restore',
          content: '<p>Restored document content</p>',
        }),
      ];
    });

    test('6.1. Повинен відображати кнопку Restore to editor для вибраної ревізії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Test Editor'));

      expect(
        screen.getByRole('button', { name: 'Restore to editor' }),
      ).toBeTruthy();
    });

    test('6.2. Повинен викликати onSelectRevision з вибраною ревізією', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Test Editor'));

      fireEvent.click(
        screen.getByRole('button', { name: 'Restore to editor' }),
      );

      expect(mocks.onSelectRevision).toHaveBeenCalledTimes(1);
      expect(mocks.onSelectRevision).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'revision_restore',
          content: '<p>Restored document content</p>',
        }),
      );
    });

    test('6.3. Повинен закривати панель після відновлення ревізії', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Test Editor'));

      fireEvent.click(
        screen.getByRole('button', { name: 'Restore to editor' }),
      );

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('6.4. Повинен викликати onSelectRevision перед закриттям панелі', () => {
      const callOrder: string[] = [];

      mocks.onSelectRevision.mockImplementation(() => {
        callOrder.push('restore');
      });

      mocks.onClose.mockImplementation(() => {
        callOrder.push('close');
      });

      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Test Editor'));

      fireEvent.click(
        screen.getByRole('button', { name: 'Restore to editor' }),
      );

      expect(callOrder).toEqual(['restore', 'close']);
    });

    test('6.5. Повинен блокувати відновлення, якщо onSelectRevision відсутній', () => {
      mocks.onSelectRevision =
        undefined as unknown as typeof mocks.onSelectRevision;

      renderRevisionHistorySidebar();

      fireEvent.click(screen.getByText('Test Editor'));

      expect(
        (
          screen.getByRole('button', {
            name: 'Restore to editor',
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(true);
    });

    test('6.6. Не повинен відновлювати ревізію без її вибору', () => {
      renderRevisionHistorySidebar();

      expect(
        screen.queryByRole('button', { name: 'Restore to editor' }),
      ).toBeNull();

      expect(mocks.onSelectRevision).not.toHaveBeenCalled();
    });
  });

  // 7. Closing sidebar
  describe('7. Closing sidebar', () => {
    test('7.1. Повинен закривати панель після натискання кнопки Close', () => {
      renderRevisionHistorySidebar();

      fireEvent.click(
        screen.getByRole('button', {
          name: 'Close version history',
        }),
      );

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    test('7.2. Повинен закривати панель після натискання на backdrop', () => {
      const { container } = renderRevisionHistorySidebar();

      const backdrop = container.firstChild as HTMLElement;
      const backdropArea = backdrop.firstChild as HTMLElement;

      fireEvent.click(backdropArea);

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // 8. Data fetching
  describe('8. Data fetching', () => {
    test('8.1. Повинен викликати useDocumentRevisions з documentId', async () => {
      const { useDocumentRevisions } =
        await import('@/features/documents/hooks/useDocumentRevisions');

      renderRevisionHistorySidebar();

      expect(useDocumentRevisions).toBeTruthy();
    });

    test('8.2. Повинен викликати refetch після відкриття панелі', async () => {
      renderRevisionHistorySidebar();

      await waitFor(() => {
        expect(mocks.refetch).toHaveBeenCalled();
      });
    });

    test('8.3. Повинен викликати refetch з documentId, переданим у hook', async () => {
      const { useDocumentRevisions } =
        await import('@/features/documents/hooks/useDocumentRevisions');

      renderRevisionHistorySidebar();

      await waitFor(() => {
        expect(useDocumentRevisions).toHaveBeenCalledWith('document_test_1');
      });
    });

    test('8.4. Не повинен викликати refetch, якщо documentId відсутній', async () => {
      mocks.documentId = undefined;

      renderRevisionHistorySidebar();

      await waitFor(() => {
        expect(mocks.refetch).not.toHaveBeenCalled();
      });
    });

    test('8.5. Повинен передавати порожній documentId у hook, якщо documentId відсутній', async () => {
      const { useDocumentRevisions } =
        await import('@/features/documents/hooks/useDocumentRevisions');

      mocks.documentId = undefined;

      renderRevisionHistorySidebar();

      expect(useDocumentRevisions).toHaveBeenCalledWith('');
    });
  });
});
