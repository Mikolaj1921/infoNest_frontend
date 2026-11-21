// ai tests - document preview modal component
// all tests - with all types of files

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from '@testing-library/react';

import { DocumentPreviewModal } from './DocumentPreviewModal';
import type { FileAttachment } from '@/types/document';
import { toast } from 'sonner';

// ua: мок PDF-компонентів без запуску справжнього PDF.js worker
vi.mock('react-pdf', async () => {
  const React = await import('react');

  return {
    pdfjs: {
      GlobalWorkerOptions: {
        workerSrc: '',
      },
    },

    Document: ({
      children,
      onLoadSuccess,
      onLoadError,
    }: {
      children: React.ReactNode;
      onLoadSuccess: (data: { numPages: number }) => void;
      onLoadError: (error: Error) => void;
    }) =>
      React.createElement(
        'div',
        { 'data-testid': 'pdf-document' },
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => onLoadSuccess({ numPages: 3 }),
          },
          'Mock PDF load success',
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            onClick: () => onLoadError(new Error('PDF loading failed')),
          },
          'Mock PDF load error',
        ),
        children,
      ),

    Page: ({ pageNumber }: { pageNumber: number }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'pdf-page',
          'data-page': pageNumber,
        },
        `PDF page ${pageNumber}`,
      ),
  };
});

// ua: мок toast-повідомлень
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('Component: DocumentPreviewModal', () => {
  const createFile = (
    overrides: Partial<FileAttachment> = {},
  ): FileAttachment =>
    ({
      id: 'file-123',
      fileName: 'document.pdf',
      size: 1024,
      createdAt: '2026-11-20T10:00:00.000Z',
      url: 'https://example.com/document.pdf',
      ...overrides,
    }) as FileAttachment;

  const onClose = vi.fn();
  const onDelete = vi.fn<(fileId: string) => Promise<boolean>>();

  const renderComponent = (
    file: FileAttachment = createFile(),
    isDeleting = false,
  ) =>
    render(
      <DocumentPreviewModal
        file={file}
        onClose={onClose}
        onDelete={onDelete}
        isDeleting={isDeleting}
      />,
    );

  beforeEach(() => {
    vi.clearAllMocks();

    onDelete.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  // --------------------------------------------------
  // 1. Basic rendering
  // --------------------------------------------------

  it('1. Має відображати модальне вікно з назвою та розміром файлу', () => {
    renderComponent();

    expect(
      screen.queryByRole('dialog', {
        name: 'Перегляд файлу document.pdf',
      }),
    ).not.toBeNull();

    expect(screen.queryByText('document.pdf')).not.toBeNull();
    expect(screen.queryByText('1 KB')).not.toBeNull();
  });

  it('2. Має відображати кнопки завантаження, видалення та закриття', () => {
    renderComponent();

    expect(screen.getByTitle('Завантажити файл')).toBeTruthy();
    expect(screen.getByTitle('Видалити файл')).toBeTruthy();
    expect(screen.getByTitle('Закрити')).toBeTruthy();
  });

  // --------------------------------------------------
  // 2. Image preview
  // --------------------------------------------------

  it('3. Має відображати зображення для підтримуваного image-файлу', () => {
    const file = createFile({
      fileName: 'photo.png',
      url: 'https://example.com/photo.png',
    });

    renderComponent(file);

    const image = screen.getByAltText('photo.png');

    expect(image).toBeTruthy();
    expect(image.getAttribute('src')).toBe('https://example.com/photo.png');
  });

  it('4. Має відображати повідомлення, якщо зображення не завантажилося', () => {
    const file = createFile({
      fileName: 'photo.png',
    });

    renderComponent(file);

    const image = screen.getByAltText('photo.png');

    fireEvent.error(image);

    expect(
      screen.queryByText(/Не вдалося відобразити зображення/i),
    ).not.toBeNull();

    expect(
      screen.queryByText(/Спробуйте завантажити файл на пристрій/i),
    ).not.toBeNull();
  });

  // --------------------------------------------------
  // 3. PDF preview
  // --------------------------------------------------

  it('5. Має відображати PDF-документ та першу сторінку', () => {
    renderComponent();

    expect(screen.queryByTestId('pdf-document')).not.toBeNull();
    expect(screen.queryByTestId('pdf-page')).not.toBeNull();

    expect(screen.getByTestId('pdf-page').getAttribute('data-page')).toBe('1');
  });

  it('6. Має оновлювати кількість сторінок після успішного завантаження PDF', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mock PDF load success',
      }),
    );

    expect(screen.queryByText('Сторінка 1 / 3')).not.toBeNull();
  });

  it('7. Має відображати помилку, якщо PDF не вдалося завантажити', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mock PDF load error',
      }),
    );

    expect(screen.queryByText(/Не вдалося відобразити PDF/i)).not.toBeNull();

    expect(screen.queryByText(/Перевірте доступ до файлу/i)).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });

  // --------------------------------------------------
  // 4. PDF pagination
  // --------------------------------------------------

  it('8. Має блокувати кнопку Previous на першій сторінці', () => {
    renderComponent();

    const previousButton = screen.getByRole('button', {
      name: 'Previous',
    }) as HTMLButtonElement;

    expect(previousButton.disabled).toBe(true);
  });

  it('9. Має перемикати сторінку вперед', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mock PDF load success',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    );

    expect(screen.getByTestId('pdf-page').getAttribute('data-page')).toBe('2');

    expect(screen.queryByText('Сторінка 2 / 3')).not.toBeNull();
  });

  it('10. Має перемикати сторінку назад', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mock PDF load success',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Previous',
      }),
    );

    expect(screen.getByTestId('pdf-page').getAttribute('data-page')).toBe('1');
  });

  it('11. Має блокувати кнопку Next на останній сторінці', () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Mock PDF load success',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Next',
      }),
    );

    const nextButton = screen.getByRole('button', {
      name: 'Next',
    }) as HTMLButtonElement;

    expect(nextButton.disabled).toBe(true);

    expect(screen.getByTestId('pdf-page').getAttribute('data-page')).toBe('3');
  });

  // --------------------------------------------------
  // 5. Download
  // --------------------------------------------------

  it('12. Має успішно завантажувати файл', async () => {
    const file = createFile();

    const mockBlob = new Blob(['PDF content'], {
      type: 'application/pdf',
    });

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: vi.fn().mockResolvedValue(mockBlob),
    });

    vi.stubGlobal('fetch', mockFetch);

    vi.stubGlobal(
      'URL',
      Object.assign(URL, {
        createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
        revokeObjectURL: vi.fn(),
      }),
    );

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});

    renderComponent(file);

    fireEvent.click(screen.getByTitle('Завантажити файл'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(file.url);
    });

    await waitFor(() => {
      expect(clickSpy).toHaveBeenCalled();
    });

    expect(URL.createObjectURL).toHaveBeenCalledWith(mockBlob);

    await waitFor(
      () => {
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      },
      { timeout: 2000 },
    );
  });

  it('13. Має показувати помилку, якщо завантаження файлу завершилося невдало', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    renderComponent();

    fireEvent.click(screen.getByTitle('Завантажити файл'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Не вдалося завантажити файл. Перевірте доступ до сховища.',
      );
    });

    consoleErrorSpy.mockRestore();
  });

  it('14. Має показувати стан завантаження під час виконання download', async () => {
    let resolveFetch: ((value: unknown) => void) | undefined;

    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          }),
      ),
    );

    renderComponent();

    const downloadButton = screen.getByTitle(
      'Завантажити файл',
    ) as HTMLButtonElement;

    fireEvent.click(downloadButton);

    expect(downloadButton.disabled).toBe(true);

    resolveFetch?.({
      ok: false,
      status: 500,
    });

    await waitFor(() => {
      expect(downloadButton.disabled).toBe(false);
    });
  });

  // --------------------------------------------------
  // 6. Delete confirmation
  // --------------------------------------------------

  it('15. Має відкривати підтвердження видалення файлу', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Видалити файл'));

    expect(screen.queryByRole('alertdialog')).not.toBeNull();

    expect(screen.queryByText(/Видалити файл\?/i)).not.toBeNull();

    expect(screen.queryByText(/Цю дію неможливо скасувати/i)).not.toBeNull();
  });

  it('16. Має відображати назву файлу у вікні підтвердження', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Видалити файл'));

    const confirmation = screen.getByRole('alertdialog');

    expect(within(confirmation).getByText('document.pdf')).toBeTruthy();
  });

  it('17. Має закривати підтвердження після натискання Скасувати', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Видалити файл'));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Скасувати',
      }),
    );

    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onDelete).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // 7. Delete success
  // --------------------------------------------------

  it('18. Має викликати onDelete з ID файлу після підтвердження', async () => {
    const file = createFile();

    renderComponent(file);

    fireEvent.click(screen.getByTitle('Видалити файл'));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Видалити',
      }),
    );

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(file.id);
    });
  });

  it('19. Має закривати підтвердження після успішного видалення', async () => {
    onDelete.mockResolvedValue(true);

    renderComponent();

    fireEvent.click(screen.getByTitle('Видалити файл'));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Видалити',
      }),
    );

    await waitFor(() => {
      expect(screen.queryByRole('alertdialog')).toBeNull();
    });
  });

  // --------------------------------------------------
  // 8. Delete error
  // --------------------------------------------------

  it('20. Має залишати підтвердження відкритим, якщо видалення не вдалося', async () => {
    onDelete.mockResolvedValue(false);

    renderComponent();

    fireEvent.click(screen.getByTitle('Видалити файл'));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Видалити',
      }),
    );

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalled();
    });

    expect(screen.queryByRole('alertdialog')).not.toBeNull();
  });

  // --------------------------------------------------
  // 9. Deleting state
  // --------------------------------------------------

  it('21. Має блокувати кнопку видалення, коли isDeleting дорівнює true', () => {
    renderComponent(createFile(), true);

    const deleteButton = screen.getByTitle(
      'Видалити файл',
    ) as HTMLButtonElement;

    expect(deleteButton.disabled).toBe(true);

    fireEvent.click(deleteButton);

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('22. Має блокувати кнопки підтвердження під час видалення', () => {
    const file = createFile();

    const { rerender } = renderComponent(file, false);

    // ua: Спочатку відкриваємо підтвердження, поки видалення не виконується
    fireEvent.click(screen.getByTitle('Видалити файл'));

    expect(screen.queryByRole('alertdialog')).not.toBeNull();

    // ua: Імітуємо початок процесу видалення
    rerender(
      <DocumentPreviewModal
        file={file}
        onClose={onClose}
        onDelete={onDelete}
        isDeleting={true}
      />,
    );

    const confirmation = screen.getByRole('alertdialog');

    const cancelButton = within(confirmation).getByRole('button', {
      name: 'Скасувати',
    }) as HTMLButtonElement;

    const confirmButton = within(confirmation).getByRole('button', {
      name: 'Видалити',
    }) as HTMLButtonElement;

    expect(cancelButton.disabled).toBe(true);
    expect(confirmButton.disabled).toBe(true);
  });

  // --------------------------------------------------
  // 10. Modal behavior
  // --------------------------------------------------

  it('23. Має викликати onClose після натискання кнопки закриття', () => {
    renderComponent();

    fireEvent.click(screen.getByTitle('Закрити'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('24. Має викликати onClose після кліку на overlay', () => {
    renderComponent();

    const dialog = screen.getByRole('dialog');

    fireEvent.click(dialog.parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('25. Не має закривати модальне вікно після кліку всередині нього', () => {
    renderComponent();

    fireEvent.click(screen.getByRole('dialog'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('26. Має відображати image preview для JPG-файлу', () => {
    const file = createFile({
      fileName: 'photo.jpg',
    });

    renderComponent(file);

    expect(screen.getByAltText('photo.jpg')).toBeTruthy();
  });

  it('27. Має відображати image preview для WEBP-файлу', () => {
    const file = createFile({
      fileName: 'photo.webp',
    });

    renderComponent(file);

    expect(screen.getByAltText('photo.webp')).toBeTruthy();
  });
});
