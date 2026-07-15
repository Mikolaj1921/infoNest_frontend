'use client';

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DocumentPage from './page';

vi.mock('next/navigation', () => ({
  useParams: vi.fn(() => ({ id: 'ws_123', docId: 'doc_123' })),
}));

vi.mock('@/features/editor/components/Editor', () => ({
  Editor: () => <div data-testid="mock-editor" />,
}));

describe('Page Component: DocumentPage UI & Indicators', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
