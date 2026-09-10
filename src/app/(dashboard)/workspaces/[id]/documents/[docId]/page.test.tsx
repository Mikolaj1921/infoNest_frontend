'use client';

// tests for the DocumentPage component, focusing on UI rendering, state management, and user interactions
// ai tests

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DocumentPage from './page';
import { useModal } from '@/hooks/use-modal-store';
import { DocumentRevision } from '@/types/document';

// ua: Мокаємо навігацію Next.js
vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'ws_123', docId: 'doc_123' })),
}));

// ua: Мокаємо менеджер модалок Zustand
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

// ua: Мокаємо хук дебаунсу
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// ua: Глобальний чистий мок для date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '1 день тому',
}));

// ua: Інтерфейс для моку редактора
interface MockEditorProps {
  onContentChange: (html: string, isDirty: boolean) => void;
  initialContent: string;
}

// ua: Мокаємо редактор без використання any
vi.mock('@/features/editor/components/Editor', () => ({
  Editor: ({ onContentChange, initialContent }: MockEditorProps) => (
    <div data-testid="mock-editor">
      <textarea
        data-testid="editor-textarea"
        defaultValue={initialContent}
        onChange={(e) => onContentChange(e.target.value, true)}
      />
    </div>
  ),
}));

describe('Page Component: DocumentPage UI & Indicators', () => {
  const mockOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // ua: Налаштування дефолтного стану сховища модалок
    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: null,
      data: {},
      onOpen: mockOpen,
      onClose: vi.fn(),
    });
  });

  test('1. Початковий рендеринг сторінки та базового заголовка редактора', () => {
    render(<DocumentPage />);

    expect(screen.queryByText('Document Editor')).not.toBeNull();
    expect(screen.queryByText('All changes saved')).not.toBeNull();
  });

  test('2. Блокування кнопки Save Changes, якщо в редакторі немає нових незбережених змін', () => {
    render(<DocumentPage />);

    const saveButton = screen.getByText('Save Changes').closest('button');

    expect(saveButton).not.toBeNull();
    if (saveButton) {
      expect(saveButton.disabled).toBe(true);
    }
  });

  test('3. Відображення текстового індикатора незбережених змін', () => {
    render(<DocumentPage />);

    expect(screen.queryByText('All changes saved')).not.toBeNull();
    expect(screen.queryByText('Saving to cloud...')).toBeNull();
  });

  test('4. Sub-task 2: Рендеринг імені автора, бейдж приватності та відносної дати оновлення', () => {
    render(<DocumentPage />);

    expect(screen.queryByText('Олексій Коваленко')).not.toBeNull();
    expect(screen.queryByText('PRIVATE')).not.toBeNull();
    expect(screen.queryByText(/1 день тому|оновлено/i)).not.toBeNull();
  });

  test('5. Sub-task 3: Клік на кнопку History має викликати панель історії змін із правильними ID', () => {
    render(<DocumentPage />);

    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);

    expect(mockOpen).toHaveBeenCalledWith(
      'revisionHistory',
      expect.objectContaining({
        documentId: 'doc_123',
        documentTitle: 'Document Editor',
      }),
    );
  });

  test('6. Sub-task 3: При активації ревізії з’являється плашка-попередження, а клік на повернення скидає стан', async () => {
    let capturedCallback: ((revision: DocumentRevision) => void) | undefined;

    mockOpen.mockImplementation((type, data) => {
      if (type === 'revisionHistory' && data?.onSelectRevision) {
        capturedCallback = data.onSelectRevision as (
          revision: DocumentRevision,
        ) => void;
      }
    });

    render(<DocumentPage />);

    const historyButton = screen.getByRole('button', { name: /History/i });
    fireEvent.click(historyButton);

    const mockSelectedRevision: DocumentRevision = {
      id: 'rev_old_999',
      documentId: 'doc_123',
      content: '<h2>Old Content</h2>',
      createdAt: new Date().toISOString(),
      editor: { id: 'u-2', name: 'Іван Редактор', email: 'ivan@test.com' },
    };

    if (capturedCallback) {
      capturedCallback(mockSelectedRevision);
    }

    const warningText = await screen.findByText(/стару версію документа/i);
    const editorName = await screen.findByText(/Іван Редактор/);

    expect(warningText).toBeTruthy();
    expect(editorName).toBeTruthy();

    const saveButton = screen.getByText('Save Changes').closest('button');
    expect(saveButton).not.toBeNull();
    if (saveButton) {
      expect(saveButton.disabled).toBe(true);
    }

    const backButton = screen.getByRole('button', {
      name: /Повернутися до актуальної версії/i,
    });
    fireEvent.click(backButton);

    // Перевіряємо, що плашка успішно зникла
    expect(screen.queryByText(/стару версію документа/i)).toBeNull();
  });
});
