import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentAttachments } from './DocumentAttachments';
import { useDocumentFiles } from '../hooks/useDocumentFiles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('../hooks/useDocumentFiles', () => ({
  useDocumentFiles: vi.fn(),
}));

vi.mock('@/services/file.service', () => ({
  fileService: {
    deleteFile: vi.fn(),
  },
}));

describe('Component: DocumentAttachments', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('1. Має успішно відрендерити стан завантаження файлів (Loading)', () => {
    vi.mocked(useDocumentFiles).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      //eslint-disable-next-line
    } as any);

    render(<DocumentAttachments documentId="doc-123" />, { wrapper });
    expect(screen.queryByText(/Loading attachments.../i)).not.toBeNull();
  });

  it('2. Має успішно відобразити порожній стан, якщо у документа немає прикріплених файлів', () => {
    vi.mocked(useDocumentFiles).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      //eslint-disable-next-line
    } as any);

    render(<DocumentAttachments documentId="doc-123" />, { wrapper });
    expect(screen.queryByText(/Attachments/i)).not.toBeNull();
    expect(
      screen.queryByText(/No files attached to this document yet/i),
    ).not.toBeNull();
  });
});
