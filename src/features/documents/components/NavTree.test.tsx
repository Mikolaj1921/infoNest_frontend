// ua: тест файл - покриває UI, логіку та взаємодію компонента NavTree
'use client';

import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { NavTree } from './NavTree';
import { useParams } from 'next/navigation';

import { WorkspaceCategory, DocumentVisibility } from '@/types/document';

// ua: спільний mock для перевірки викликів модальних вікон
const { mockOnOpen } = vi.hoisted(() => ({
  mockOnOpen: vi.fn(),
}));

// ua: мок зовнішньої залежності роутера Next.js
vi.mock('next/navigation', () => ({
  useParams: vi.fn(),
}));

// ua: мок системи модальних вікон
vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    onOpen: mockOnOpen,
  }),
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

    localStorage.clear();

    // ua: встановлення стандартного workspace для тестів
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
    });
  });

  // --------------------------------------------------
  // 1. Basic rendering
  // --------------------------------------------------

  test('1. Має коректно рендерити назви всіх папок (категорій)', () => {
    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Marketing Content')).not.toBeNull();
    expect(screen.queryByText('Empty Folder')).not.toBeNull();
  });

  test('2. Має розгортати папку і показувати документи при кліку на неї', () => {
    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Marketing Content',
      }),
    );

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
  });

  test('3. Має автоматично розгортати батьківську папку, якщо її документ є активним в URL', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
      docId: 'doc_social_media',
    });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
  });

  test('4. Має зберігати стан розгорнутих папок у localStorage під унікальним ключем воркспейсу', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Marketing Content',
      }),
    );

    const savedIds = localStorage.getItem(
      'infonest-expanded-folders-ws_test_1',
    );

    expect(savedIds).not.toBeNull();

    if (savedIds) {
      expect(JSON.parse(savedIds)).toContain('cat_marketing');
    }
  });

  // --------------------------------------------------
  // 2. Folder expansion and collapse
  // --------------------------------------------------

  test('5. Має згортати відкриту папку після повторного кліку', () => {
    render(<NavTree categories={mockCategories} />);

    const folderButton = screen.getByRole('button', {
      name: (name) => name === 'Marketing Content',
    });

    fireEvent.click(folderButton);

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();

    fireEvent.click(folderButton);

    expect(screen.queryByText('Social Media Strategy')).toBeNull();
  });

  test('6. Має незалежно розгортати декілька папок', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Marketing Content',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Empty Folder',
      }),
    );

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
    expect(screen.queryByText('Empty folder')).not.toBeNull();

    const savedIds = JSON.parse(
      localStorage.getItem('infonest-expanded-folders-ws_test_1') || '[]',
    );

    expect(savedIds).toContain('cat_marketing');
    expect(savedIds).toContain('cat_empty');
  });

  test('7. Має відображати повідомлення для порожньої папки після її розгортання', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Empty Folder',
      }),
    );

    expect(screen.queryByText('Empty folder')).not.toBeNull();
  });

  // --------------------------------------------------
  // 3. localStorage persistence
  // --------------------------------------------------

  test('8. Має відновлювати відкриті папки з localStorage', () => {
    localStorage.setItem(
      'infonest-expanded-folders-ws_test_1',
      JSON.stringify(['cat_marketing']),
    );

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();
  });

  test('9. Має зберігати інші відкриті папки після згортання однієї з них', () => {
    localStorage.setItem(
      'infonest-expanded-folders-ws_test_1',
      JSON.stringify(['cat_marketing', 'cat_empty']),
    );

    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Marketing Content',
      }),
    );

    const savedIds = JSON.parse(
      localStorage.getItem('infonest-expanded-folders-ws_test_1') || '[]',
    );

    expect(savedIds).not.toContain('cat_marketing');
    expect(savedIds).toContain('cat_empty');
  });

  test('10. Має використовувати окремий ключ localStorage для кожного workspace', () => {
    localStorage.setItem(
      'infonest-expanded-folders-ws_test_1',
      JSON.stringify(['cat_marketing']),
    );

    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_2',
    });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).toBeNull();

    expect(
      localStorage.getItem('infonest-expanded-folders-ws_test_2'),
    ).not.toBeNull();

    const workspaceOneIds = JSON.parse(
      localStorage.getItem('infonest-expanded-folders-ws_test_1') || '[]',
    );

    expect(workspaceOneIds).toContain('cat_marketing');
  });

  test('11. Має коректно обробляти некоректні JSON-дані з localStorage', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    localStorage.setItem('infonest-expanded-folders-ws_test_1', 'invalid-json');

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Marketing Content')).not.toBeNull();
    expect(screen.queryByText('Social Media Strategy')).toBeNull();

    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  // --------------------------------------------------
  // 4. Active document
  // --------------------------------------------------

  test('12. Має зберігати автоматично відкриту папку активного документа', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
      docId: 'doc_social_media',
    });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).not.toBeNull();

    const savedIds = JSON.parse(
      localStorage.getItem('infonest-expanded-folders-ws_test_1') || '[]',
    );

    expect(savedIds).toContain('cat_marketing');
  });

  test('13. Має не розгортати папку, якщо активний документ не належить жодній категорії', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
      docId: 'unknown_document',
    });

    render(<NavTree categories={mockCategories} />);

    expect(screen.queryByText('Social Media Strategy')).toBeNull();
  });

  test('14. Має формувати правильне посилання на документ', () => {
    vi.mocked(useParams).mockReturnValue({
      id: 'ws_test_1',
      docId: 'doc_social_media',
    });

    render(<NavTree categories={mockCategories} />);

    const documentLink = screen.getByRole('link', {
      name: /Social Media Strategy/,
    });

    expect(documentLink.getAttribute('href')).toBe(
      '/workspaces/ws_test_1/documents/doc_social_media',
    );
  });

  // --------------------------------------------------
  // 5. Folder actions and modal integration
  // --------------------------------------------------

  test('15. Має відкривати модальне вікно створення документа в категорії', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create document in Marketing Content',
      }),
    );

    expect(mockOnOpen).toHaveBeenCalledWith('createDocument', {
      categoryId: 'cat_marketing',
      categoryName: 'Marketing Content',
    });
  });

  test('16. Має відкривати модальне вікно перейменування категорії', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Rename Marketing Content',
      }),
    );

    expect(mockOnOpen).toHaveBeenCalledWith('editCategory', {
      categoryId: 'cat_marketing',
      categoryName: 'Marketing Content',
    });
  });

  test('17. Має відкривати модальне вікно видалення категорії', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete Marketing Content',
      }),
    );

    expect(mockOnOpen).toHaveBeenCalledWith('deleteCategory', {
      categoryId: 'cat_marketing',
      categoryName: 'Marketing Content',
    });
  });

  test('18. Має відкривати модальне вікно створення документа для правильної категорії', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Create document in Empty Folder',
      }),
    );

    expect(mockOnOpen).toHaveBeenCalledWith('createDocument', {
      categoryId: 'cat_empty',
      categoryName: 'Empty Folder',
    });
  });

  test('19. Має зупиняти поширення кліку при натисканні кнопок дій категорії', () => {
    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Rename Marketing Content',
      }),
    );

    // ua: клік по дії не повинен розгортати саму папку
    expect(screen.queryByText('Social Media Strategy')).toBeNull();

    expect(mockOnOpen).toHaveBeenCalledTimes(1);
  });

  // --------------------------------------------------
  // 6. Empty and fallback states
  // --------------------------------------------------

  test('20. Має коректно рендерити порожній список категорій', () => {
    const { container } = render(<NavTree categories={[]} />);

    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByText('Marketing Content')).toBeNull();
    expect(screen.queryByText('Empty Folder')).toBeNull();
  });

  test('21. Має використовувати global як workspaceId, якщо id відсутній у URL', () => {
    vi.mocked(useParams).mockReturnValue({});

    render(<NavTree categories={mockCategories} />);

    fireEvent.click(
      screen.getByRole('button', {
        name: (name) => name === 'Marketing Content',
      }),
    );

    const savedIds = localStorage.getItem('infonest-expanded-folders-global');

    expect(savedIds).not.toBeNull();

    if (savedIds) {
      expect(JSON.parse(savedIds)).toContain('cat_marketing');
    }
  });
});
