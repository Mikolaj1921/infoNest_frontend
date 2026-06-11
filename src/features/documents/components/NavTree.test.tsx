// ua: тест файл - покриває основну логіку компонента NavTree(аі)
'use client';

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavTree } from './NavTree';
import { useParams } from 'next/navigation';
import { WorkspaceCategory, DocumentVisibility } from '@/types/document';

// ua: макетуємо (mock) зовнішню залежність роутера Next.js
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

// ua: підготовлені фейкові дані структури воркспейсу для тестів
const mockCategories: WorkspaceCategory[] = [
  {
    id: 'cat_marketing',
    name: 'Marketing Content',
    workspaceId: 'ws_test_1',
    createdAt: '2026-06-11T00:00:00.000Z',
    updatedAt: '2026-06-11T00:00:00.000Z',
    documents: [
      {
        id: 'doc_social_media',
        title: 'Social Media Strategy',
        content: '# Strategy text',
        categoryId: 'cat_marketing',
        ownerId: 'usr_1',
        visibility: DocumentVisibility.PRIVATE,
        createdAt: '2026-06-11T00:00:00.000Z',
        updatedAt: '2026-06-11T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'cat_empty',
    name: 'Empty Folder',
    workspaceId: 'ws_test_1',
    createdAt: '2026-06-11T00:00:00.000Z',
    updatedAt: '2026-06-11T00:00:00.000Z',
    documents: [],
  },
];

describe('UI & Logic: NavTree Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear(); // ua: очистка localStorage перед кожним тестом
  });

  test('1. Має коректно рендерити назви всіх папок (категорій)', () => {
    vi.mocked(useParams).mockReturnValue({ id: 'ws_test_1' });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Marketing Content')).not.toBeNull();
    expect(screen.queryByText('Empty Folder')).not.toBeNull();
  });

  test('2. Має розгортати папку і показувати документи при кліку на неї', () => {
    vi.mocked(useParams).mockReturnValue({ id: 'ws_test_1' });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).toBeNull();

    const folderButton = screen.getByText('Marketing Content');
    fireEvent.click(folderButton);
    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
  });

  test('3. Має автоматично розгортати батьківську папку, якщо її документ є активним в URL (Auto-Expand)', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
      docId: 'doc_social_media',
    });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
  });

  test('4. Має зберігати стан розгорнутих папок у localStorage під унікальним ключем воркспейсу', () => {
    vi.mocked(useParams).mockReturnValue({ id: 'ws_test_1' });

    render(<NavTree categories={mockCategories} />);

    const folderButton = screen.getByText('Marketing Content');
    fireEvent.click(folderButton);

    const savedIds = localStorage.getItem(
      'infonest-expanded-folders-ws_test_1',
    );
    expect(savedIds).not.toBeNull();
    if (savedIds) {
      expect(JSON.parse(savedIds)).toContain('cat_marketing');
    }
  });
});
