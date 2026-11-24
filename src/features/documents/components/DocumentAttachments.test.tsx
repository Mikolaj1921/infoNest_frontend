// ai tests - document attachments component

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DocumentAttachments } from './DocumentAttachments';
import { useDocumentFiles } from '../hooks/useDocumentFiles';
import { fileService } from '@/services/file.service';
import { validateUploadedFile } from '@/validators/file-validator';
import { toast } from 'sonner';

import type { FileAttachment } from '@/types/document';

// ua: мок отримання файлів документа
vi.mock('../hooks/useDocumentFiles', () => ({
  useDocumentFiles: vi.fn(),
}));

// ua: мок сервісу роботи з файлами
vi.mock('@/services/file.service', () => ({
  fileService: {
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
  },
}));

// ua: мок валідації завантажуваних файлів
vi.mock('@/validators/file-validator', () => ({
  validateUploadedFile: vi.fn(),
}));

// ua: мок toast-повідомлень
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ua: мок компонента прогресу завантаження
vi.mock('./UploadProgress', () => ({
  UploadProgress: ({
    fileName,
    progress,
  }: {
    fileName: string;
    progress: number;
  }) => (
    <div data-testid="upload-progress">
      {fileName}: {progress}%
    </div>
  ),
}));

// ua: мок модального вікна попереднього перегляду
vi.mock('./DocumentPreviewModal', () => ({
  DocumentPreviewModal: ({
    file,
    onClose,
    onDelete,
    isDeleting,
  }: {
    file: FileAttachment;
    onClose: () => void;
    onDelete: (fileId: string) => Promise<boolean>;
    isDeleting: boolean;
  }) => (
    <div data-testid="document-preview-modal">
      <span>{file.fileName}</span>

      <button type="button" onClick={onClose}>
        Close preview
      </button>

      <button
        type="button"
        disabled={isDeleting}
        onClick={() => onDelete(file.id)}
      >
        Delete preview file
      </button>
    </div>
  ),
}));

describe('Component: DocumentAttachments', () => {
  let queryClient: QueryClient;
  let invalidateQueriesSpy: ReturnType<typeof vi.spyOn>;

  const documentId = 'doc-123';

  // ua: тестовий файл
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

  const mockFiles = (files: FileAttachment[] = []) => {
    vi.mocked(useDocumentFiles).mockReturnValue({
      data: files,
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useDocumentFiles>);
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const renderComponent = () =>
    render(<DocumentAttachments documentId={documentId} />, { wrapper });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });

    invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    vi.clearAllMocks();

    vi.mocked(validateUploadedFile).mockReturnValue({
      isValid: true,
    } as ReturnType<typeof validateUploadedFile>);
  });

  afterEach(() => {
    queryClient.clear();
  });

  // --------------------------------------------------
  // 1. Loading
  // --------------------------------------------------

  it('1. Має відображати стан завантаження файлів', () => {
    vi.mocked(useDocumentFiles).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useDocumentFiles>);

    renderComponent();

    expect(screen.queryByText(/Loading attachments/i)).not.toBeNull();
  });

  // --------------------------------------------------
  // 2. Error
  // --------------------------------------------------

  it('2. Має відображати помилку завантаження файлів', () => {
    vi.mocked(useDocumentFiles).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    } as ReturnType<typeof useDocumentFiles>);

    renderComponent();

    expect(screen.queryByText(/Failed to load attachments/i)).not.toBeNull();
  });

  // --------------------------------------------------
  // 3. Empty state
  // --------------------------------------------------

  it('3. Має відображати порожній стан, якщо файлів немає', () => {
    mockFiles([]);

    renderComponent();

    expect(screen.queryByText('Attachments')).not.toBeNull();

    expect(
      screen.queryByText(/No files attached to this document yet/i),
    ).not.toBeNull();
  });

  // --------------------------------------------------
  // 4. File list
  // --------------------------------------------------

  it('4. Має відображати список прикріплених файлів', () => {
    mockFiles([
      createFile(),
      createFile({
        id: 'file-456',
        fileName: 'image.png',
        size: 2048,
      }),
    ]);

    renderComponent();

    expect(screen.queryByText('document.pdf')).not.toBeNull();
    expect(screen.queryByText('image.png')).not.toBeNull();
    expect(screen.queryByText('2')).not.toBeNull();
  });

  // --------------------------------------------------
  // 5. Preview
  // --------------------------------------------------

  it('5. Має відкривати preview для підтримуваного файлу', () => {
    const file = createFile();

    mockFiles([file]);

    renderComponent();

    fireEvent.click(screen.getByText(file.fileName));

    expect(screen.queryByTestId('document-preview-modal')).not.toBeNull();
  });

  it('6. Має закривати preview після натискання кнопки закриття', () => {
    const file = createFile();

    mockFiles([file]);

    renderComponent();

    fireEvent.click(screen.getByText(file.fileName));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Close preview',
      }),
    );

    expect(screen.queryByTestId('document-preview-modal')).toBeNull();
  });

  // --------------------------------------------------
  // 6. Unsupported file
  // --------------------------------------------------

  it('7. Має відхиляти відкриття файлу непідтримуваного формату', () => {
    const file = createFile({
      fileName: 'archive.zip',
    });

    mockFiles([file]);

    renderComponent();

    fireEvent.click(screen.getByText(file.fileName));

    expect(toast.error).toHaveBeenCalledWith(
      'This file format is not supported for preview.',
    );

    expect(screen.queryByTestId('document-preview-modal')).toBeNull();
  });

  // --------------------------------------------------
  // 7. Upload validation
  // --------------------------------------------------

  it('8. Має показувати помилку, якщо файл не пройшов валідацію', async () => {
    mockFiles([]);

    vi.mocked(validateUploadedFile).mockReturnValue({
      isValid: false,
      error: 'File is too large',
    } as ReturnType<typeof validateUploadedFile>);

    renderComponent();

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['content'], 'large.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('File is too large');
    });

    expect(fileService.uploadFile).not.toHaveBeenCalled();
  });

  // --------------------------------------------------
  // 8. Upload success
  // --------------------------------------------------

  it('9. Має успішно завантажувати файл та оновлювати кеш', async () => {
    mockFiles([]);

    vi.mocked(fileService.uploadFile).mockImplementation(
      async (_documentId, _file, onProgress) => {
        onProgress(100);
        return {} as never;
      },
    );

    renderComponent();

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        file,
        expect.any(Function),
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('File uploaded successfully');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['document-files', documentId],
    });

    await waitFor(() => {
      expect(screen.queryByTestId('upload-progress')).toBeNull();
    });
  });

  // --------------------------------------------------
  // 9. Upload error
  // --------------------------------------------------

  it('10. Має обробляти помилку під час завантаження файлу', async () => {
    mockFiles([]);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(fileService.uploadFile).mockRejectedValue(
      new Error('Upload failed'),
    );

    renderComponent();

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to upload file');
    });

    expect(screen.queryByTestId('upload-progress')).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  // --------------------------------------------------
  // 10. Upload progress
  // --------------------------------------------------

  it('11. Має відображати прогрес завантаження файлу', async () => {
    mockFiles([]);

    let resolveUpload: (() => void) | undefined;

    vi.mocked(fileService.uploadFile).mockImplementation(
      async (_documentId, _file, onProgress) => {
        onProgress(60);

        await new Promise<void>((resolve) => {
          resolveUpload = resolve;
        });

        return {} as never;
      },
    );

    renderComponent();

    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;

    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.change(input, {
      target: {
        files: [file],
      },
    });

    expect(await screen.findByText('document.pdf: 60%')).not.toBeNull();

    resolveUpload?.();

    await waitFor(() => {
      expect(screen.queryByTestId('upload-progress')).toBeNull();
    });
  });

  // --------------------------------------------------
  // 11. Delete success
  // --------------------------------------------------

  it('12. Має видаляти файл та закривати preview після успішного видалення', async () => {
    const file = createFile();

    mockFiles([file]);

    vi.mocked(fileService.deleteFile).mockResolvedValue({} as never);

    renderComponent();

    fireEvent.click(screen.getByText(file.fileName));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete preview file',
      }),
    );

    await waitFor(() => {
      expect(fileService.deleteFile).toHaveBeenCalledWith(file.id);
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('File deleted successfully');
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['document-files', documentId],
    });

    expect(screen.queryByTestId('document-preview-modal')).toBeNull();
  });

  // --------------------------------------------------
  // 12. Delete error
  // --------------------------------------------------

  it('13. Має обробляти помилку під час видалення файлу', async () => {
    const file = createFile();

    mockFiles([file]);

    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    vi.mocked(fileService.deleteFile).mockRejectedValue(
      new Error('Delete failed'),
    );

    renderComponent();

    fireEvent.click(screen.getByText(file.fileName));

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Delete preview file',
      }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to delete file');
    });

    // ua: preview залишається відкритим після невдалого видалення
    expect(screen.queryByTestId('document-preview-modal')).not.toBeNull();

    consoleErrorSpy.mockRestore();
  });

  // --------------------------------------------------
  // 13. Drag and drop
  // --------------------------------------------------

  it('14. Має активувати стан drag-and-drop під час перетягування файлу', () => {
    mockFiles([]);

    renderComponent();

    const dropzone = screen.getByText(
      /Drag and drop file here, or click to browse/i,
    ).parentElement?.parentElement;

    expect(dropzone).not.toBeNull();

    fireEvent.dragOver(dropzone!);

    expect(screen.queryByText('Drop file here to upload')).not.toBeNull();

    fireEvent.dragLeave(dropzone!);

    expect(
      screen.queryByText(/Drag and drop file here, or click to browse/i),
    ).not.toBeNull();
  });

  it('15. Має завантажувати файл після його перетягування у dropzone', async () => {
    mockFiles([]);

    vi.mocked(fileService.uploadFile).mockResolvedValue({} as never);

    renderComponent();

    const dropzone = screen.getByText(
      /Drag and drop file here, or click to browse/i,
    ).parentElement?.parentElement;

    const file = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    fireEvent.drop(dropzone!, {
      dataTransfer: {
        files: [file],
      },
    });

    await waitFor(() => {
      expect(fileService.uploadFile).toHaveBeenCalledWith(
        documentId,
        file,
        expect.any(Function),
      );
    });
  });

  // --------------------------------------------------
  // 14. Keyboard interaction
  // --------------------------------------------------

  it('16. Має відкривати preview клавішею Enter', () => {
    const file = createFile();

    mockFiles([file]);

    renderComponent();

    const fileCard = screen.getByRole('button', {
      name: /document\.pdf/i,
    });

    fireEvent.keyDown(fileCard, {
      key: 'Enter',
    });

    expect(screen.queryByTestId('document-preview-modal')).not.toBeNull();
  });

  it('17. Має відкривати preview клавішею Space', () => {
    const file = createFile();

    mockFiles([file]);

    renderComponent();

    const fileCard = screen.getByRole('button', {
      name: /document\.pdf/i,
    });

    fireEvent.keyDown(fileCard, {
      key: ' ',
    });

    expect(screen.queryByTestId('document-preview-modal')).not.toBeNull();
  });
});
