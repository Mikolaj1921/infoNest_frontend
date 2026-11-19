'use client';

// tests for the DocumentPage component, focusing on UI rendering, state management, and user interactions
// ai tests

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
  within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DocumentPage from './page';
import { useModal } from '@/hooks/use-modal-store';
import { useDocument } from '@/features/documents/hooks/useDocument';
import type { DocumentRevision, WorkspaceDocument } from '@/types/document';

// ua: повне глушіння хука використання файлів, щоб він повертав порожній масив у цьому тесті
vi.mock('@/features/documents/hooks/useDocumentFiles', () => ({
  useDocumentFiles: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('@/services/file.service', () => ({
  fileService: {
    deleteFile: vi.fn(),
  },
}));

// ua: Мокаємо навігацію Next.js
const mocks = vi.hoisted(() => ({
  routerBack: vi.fn(),
  mockOpen: vi.fn(),
  deleteDocument: vi.fn(),
  updateDocument: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  debounceEnabled: false,
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws_123', docId: 'doc_123' }),
  useRouter: () => ({
    back: mocks.routerBack,
  }),
}));

// ua: Мокаємо менеджер модалок Zustand
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

// ua: Мокаємо хук дебаунсу
// За замовчуванням зберігаємо попереднє значення,
// щоб можна було перевірити стан Unsaved changes.
// Для тестів автозбереження debounceEnabled вмикається вручну.
vi.mock('@/hooks/useDebounce', async () => {
  const ReactModule = await import('react');

  return {
    useDebounce: (value: string) => {
      const debouncedValue = ReactModule.useRef(value);

      if (mocks.debounceEnabled) {
        debouncedValue.current = value;
      }

      return debouncedValue.current;
    },
  };
});

// ua: Глобальний чистий мок для date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '1 день тому',
}));

// ua: Мокаємо отримання та оновлення документа
vi.mock('@/features/documents/hooks/useDocument', () => ({
  useDocument: vi.fn(),
}));

vi.mock('@/features/documents/hooks/useUpdateDocument', () => ({
  useUpdateDocument: () => ({
    mutateAsync: mocks.updateDocument,
    isPending: false,
  }),
}));

vi.mock('@/services/document.service', () => ({
  documentService: {
    deleteDocument: mocks.deleteDocument,
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
}));

// ua: Інтерфейс для моку редактора
interface MockEditorProps {
  initialContent: string;
  onContentChange: (html: string) => void;
}

// ua: Мокаємо редактор без використання any
vi.mock('@/features/editor/components/Editor', () => ({
  Editor: ({ onContentChange, initialContent }: MockEditorProps) => (
    <div data-testid="mock-editor">
      <textarea
        data-testid="editor-textarea"
        defaultValue={initialContent}
        onChange={(event) => onContentChange(event.target.value)}
      />
    </div>
  ),
}));

// ua: Глушимо компонент вкладень, оскільки він тестується окремо
vi.mock('@/features/documents/components/DocumentAttachments', () => ({
  DocumentAttachments: ({ documentId }: { documentId: string }) => (
    <div data-testid="document-attachments">{documentId}</div>
  ),
}));

describe('Page Component: DocumentPage UI & Functionality', () => {
  let queryClient: QueryClient;

  const mockDocument = {
    id: 'doc_123',
    title: 'Document Editor',
    content: '<h1>Test Content</h1>',
    updatedAt: new Date().toISOString(),
  } as WorkspaceDocument;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.clearAllMocks();

    // ua: За замовчуванням автозбереження не запускається миттєво
    mocks.debounceEnabled = false;

    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: mocks.mockOpen,
      onClose: vi.fn(),
    });

    vi.mocked(useDocument).mockReturnValue({
      data: mockDocument,
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useDocument>);

    mocks.updateDocument.mockResolvedValue({
      ...mockDocument,
      content: '<h1>Updated Content</h1>',
    });

    mocks.deleteDocument.mockResolvedValue(undefined);
  });

  afterEach(() => {
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test('1. Початковий рендеринг сторінки та завантаження даних документа', async () => {
    render(<DocumentPage />, { wrapper });

    const titleInput = await screen.findByRole('textbox', {
      name: /document title/i,
    });

    expect((titleInput as HTMLInputElement).value).toBe('Document Editor');

    expect(screen.getByTestId('mock-editor')).toBeTruthy();
    expect(screen.getByText('All changes saved')).toBeTruthy();
    expect(screen.getByText('Attachments')).toBeTruthy();

    expect(screen.getByTestId('document-attachments').textContent).toBe(
      'doc_123',
    );
  });

  test('2. Відображення стану завантаження документа', () => {
    vi.mocked(useDocument).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as ReturnType<typeof useDocument>);

    render(<DocumentPage />, { wrapper });

    expect(screen.getByText('Loading document...')).toBeTruthy();
    expect(screen.queryByTestId('mock-editor')).toBeNull();
  });

  test('3. Відображення помилки, якщо документ не вдалося завантажити', () => {
    vi.mocked(useDocument).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Document loading failed'),
    } as ReturnType<typeof useDocument>);

    render(<DocumentPage />, { wrapper });

    expect(screen.getByText('Unable to load document')).toBeTruthy();
    expect(screen.getByText('Document loading failed')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: /go back/i }));

    expect(mocks.routerBack).toHaveBeenCalledTimes(1);
  });

  test('4. Відображення тексту за замовчуванням, якщо документ не має вмісту', async () => {
    vi.mocked(useDocument).mockReturnValue({
      data: {
        ...mockDocument,
        content: '',
      },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useDocument>);

    render(<DocumentPage />, { wrapper });

    const editor = await screen.findByTestId('editor-textarea');

    expect((editor as HTMLTextAreaElement).value).toBe(
      '<h1>New Document</h1><p>Start writing here...</p>',
    );
  });

  test('5. Відображення індикатора незбережених змін після редагування вмісту', async () => {
    render(<DocumentPage />, { wrapper });

    const editor = await screen.findByTestId('editor-textarea');

    fireEvent.change(editor, {
      target: { value: '<h1>New Content</h1>' },
    });

    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });

  test('6. Автоматичне збереження вмісту після його редагування', async () => {
    mocks.debounceEnabled = true;

    render(<DocumentPage />, { wrapper });

    const editor = await screen.findByTestId('editor-textarea');

    fireEvent.change(editor, {
      target: { value: '<h1>Updated Content</h1>' },
    });

    await waitFor(() => {
      expect(mocks.updateDocument).toHaveBeenCalledWith({
        content: '<h1>Updated Content</h1>',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('All changes saved')).toBeTruthy();
    });
  });

  test('7. Відображення помилки, якщо автоматичне збереження не вдалося', async () => {
    mocks.debounceEnabled = true;

    mocks.updateDocument.mockRejectedValueOnce(
      new Error('Failed to save document'),
    );

    render(<DocumentPage />, { wrapper });

    const editor = await screen.findByTestId('editor-textarea');

    fireEvent.change(editor, {
      target: { value: '<h1>Content with error</h1>' },
    });

    await waitFor(() => {
      expect(mocks.updateDocument).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeTruthy();
    });
  });

  test('8. Збереження заголовка документа після втрати фокуса', async () => {
    render(<DocumentPage />, { wrapper });

    const titleInput = await screen.findByRole('textbox', {
      name: /document title/i,
    });

    fireEvent.change(titleInput, {
      target: { value: 'Updated Document Title' },
    });

    fireEvent.blur(titleInput);

    await waitFor(() => {
      expect(mocks.updateDocument).toHaveBeenCalledWith({
        title: 'Updated Document Title',
      });
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Document title saved');
  });

  test('9. Заборона збереження порожнього заголовка документа', async () => {
    render(<DocumentPage />, { wrapper });

    const titleInput = await screen.findByRole('textbox', {
      name: /document title/i,
    });

    fireEvent.change(titleInput, {
      target: { value: '   ' },
    });

    fireEvent.blur(titleInput);

    // ua: Поточна реалізація пропускає збереження порожнього заголовка без toast
    expect(mocks.updateDocument).not.toHaveBeenCalled();
    expect(mocks.toastError).not.toHaveBeenCalled();
  });

  test('10. Клік на кнопку Version history відкриває історію з правильними даними', async () => {
    render(<DocumentPage />, { wrapper });

    const historyButton = await screen.findByRole('button', {
      name: /version history/i,
    });

    fireEvent.click(historyButton);

    expect(mocks.mockOpen).toHaveBeenCalledWith(
      'revisionHistory',
      expect.objectContaining({
        documentId: 'doc_123',
        currentContent: '<h1>Test Content</h1>',
        onSelectRevision: expect.any(Function),
      }),
    );
  });

  test('11. Відновлення вмісту документа з вибраної ревізії', async () => {
    render(<DocumentPage />, { wrapper });

    const historyButton = await screen.findByRole('button', {
      name: /version history/i,
    });

    fireEvent.click(historyButton);

    const openCall = mocks.mockOpen.mock.calls[0];

    const revisionData = openCall[1] as {
      onSelectRevision: (revision: DocumentRevision) => void;
    };

    const mockSelectedRevision: DocumentRevision = {
      id: 'rev_old_999',
      documentId: 'doc_123',
      content: '<h2>Old Content</h2>',
      createdAt: new Date().toISOString(),
      editor: {
        id: 'u-2',
        name: 'Іван Редактор',
        email: 'ivan@test.com',
      },
    };

    act(() => {
      revisionData.onSelectRevision(mockSelectedRevision);
    });

    expect(await screen.findByTestId('editor-textarea')).toBeTruthy();

    expect(
      (screen.getByTestId('editor-textarea') as HTMLTextAreaElement).value,
    ).toBe('<h2>Old Content</h2>');

    expect(screen.getByText('Unsaved changes')).toBeTruthy();
    expect(mocks.updateDocument).not.toHaveBeenCalled();
  });

  test('12. Закриття вікна підтвердження видалення документа кнопкою Cancel', async () => {
    render(<DocumentPage />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: /^delete$/i }));

    const dialog = screen.getByRole('dialog');

    expect(dialog).toBeTruthy();
    expect(within(dialog).getByText('Delete document?')).toBeTruthy();

    fireEvent.click(within(dialog).getByRole('button', { name: /cancel/i }));

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(mocks.deleteDocument).not.toHaveBeenCalled();
  });

  test('13. Успішне видалення документа та повернення на попередню сторінку', async () => {
    render(<DocumentPage />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: /^delete$/i }));

    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(mocks.deleteDocument).toHaveBeenCalledWith('doc_123');
    });

    await waitFor(() => {
      expect(mocks.toastSuccess).toHaveBeenCalledWith('Document deleted');
      expect(mocks.routerBack).toHaveBeenCalledTimes(1);
    });
  });

  test('14. Відображення повідомлення про помилку, якщо видалення документа не вдалося', async () => {
    mocks.deleteDocument.mockRejectedValueOnce(new Error('Delete failed'));

    render(<DocumentPage />, { wrapper });

    fireEvent.click(await screen.findByRole('button', { name: /^delete$/i }));

    const dialog = screen.getByRole('dialog');

    fireEvent.click(within(dialog).getByRole('button', { name: /^delete$/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        'Failed to delete document',
      );
    });

    expect(mocks.routerBack).not.toHaveBeenCalled();
  });
});
