'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FileAttachment } from '@/types/document';
import { formatBytes } from '@/utils/file-format';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDownload,
  faFilePdf,
  faImage,
  faSpinner,
  faTrashCan,
  faXmark,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'sonner';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ua: налаштування PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

interface DocumentPreviewModalProps {
  file: FileAttachment;
  onClose: () => void;
  onDelete: (fileId: string) => Promise<boolean>;
  isDeleting?: boolean;
}

const getFileType = (fileName: string): 'pdf' | 'image' | null => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return 'pdf';

  if (
    ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'avif'].includes(
      extension || '',
    )
  ) {
    return 'image';
  }

  return null;
};

export const DocumentPreviewModal = ({
  file,
  onClose,
  onDelete,
  isDeleting = false,
}: DocumentPreviewModalProps) => {
  const [imageError, setImageError] = useState(false);
  const [pdfPages, setPdfPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pdfError, setPdfError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const fileType = getFileType(file.fileName);

  // ua: завантаження файлу через Blob
  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const response = await fetch(file.url);

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('File download failed:', error);
      toast.error('Не вдалося завантажити файл. Перевірте доступ до сховища.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ua: підтвердження видалення файлу
  const handleConfirmDelete = async () => {
    if (isDeleting) return;

    const deleted = await onDelete(file.id);

    if (deleted) {
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Перегляд файлу ${file.fileName}`}
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111318] shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ua: верхня панель */}
        <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-white/10 bg-[#171a21] px-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/70">
              <FontAwesomeIcon
                icon={fileType === 'pdf' ? faFilePdf : faImage}
                className="h-4 w-4"
              />
            </div>

            <div className="min-w-0">
              <p
                className="truncate text-sm font-semibold text-white"
                title={file.fileName}
              >
                {file.fileName}
              </p>
              <p className="text-[11px] text-white/40">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex h-9 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
              title="Завантажити файл"
            >
              {isDownloading ? (
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon icon={faDownload} />
              )}
              <span className="hidden sm:inline">Завантажити</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={isDeleting}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-red-500/15 hover:text-red-400 disabled:opacity-50"
              title="Видалити файл"
            >
              <FontAwesomeIcon icon={faTrashCan} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/50 transition hover:bg-white/10 hover:text-white"
              title="Закрити"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ua: область перегляду */}
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-[#090a0d]">
          {fileType === 'pdf' && !pdfError && (
            <div className="flex h-full w-full flex-col items-center overflow-auto">
              <Document
                file={file.url}
                onLoadSuccess={({ numPages }) => {
                  setPdfPages(numPages);
                  setCurrentPage(1);
                }}
                onLoadError={(error) => {
                  console.error('PDF loading error:', error);
                  setPdfError(true);
                }}
                loading={
                  <div className="flex h-full items-center justify-center gap-3 text-sm text-white/50">
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                    Завантаження PDF...
                  </div>
                }
                error={
                  <div className="p-6 text-center text-sm text-red-400">
                    Не вдалося відкрити PDF-файл.
                  </div>
                }
              >
                <Page
                  pageNumber={currentPage}
                  renderTextLayer
                  renderAnnotationLayer
                  className="my-5 shadow-2xl"
                  width={Math.min(
                    typeof window !== 'undefined'
                      ? window.innerWidth * 0.75
                      : 900,
                    1000,
                  )}
                />
              </Document>

              {pdfPages > 1 && (
                <div className="sticky bottom-4 flex items-center gap-4 rounded-xl border border-white/10 bg-[#171a21] px-4 py-2 text-xs text-white shadow-xl">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30"
                  >
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>

                  <span>
                    Сторінка {currentPage} / {pdfPages}
                  </span>

                  <button
                    type="button"
                    disabled={currentPage >= pdfPages}
                    onClick={() =>
                      setCurrentPage((page) => Math.min(pdfPages, page + 1))
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-white/10 disabled:opacity-30"
                  >
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              )}
            </div>
          )}

          {fileType === 'pdf' && pdfError && (
            <div className="px-6 text-center text-sm text-white/50">
              Не вдалося відобразити PDF.
              <p className="mt-2 text-xs text-white/30">
                Перевірте доступ до файлу та налаштування CORS у R2.
              </p>
            </div>
          )}

          {fileType === 'image' && !imageError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.url}
              alt={file.fileName}
              className="max-h-full max-w-full select-none object-contain p-3 sm:p-6"
              onError={() => setImageError(true)}
            />
          )}

          {fileType === 'image' && imageError && (
            <div className="px-6 text-center text-sm text-white/50">
              Не вдалося відобразити зображення.
              <p className="mt-2 text-xs text-white/30">
                Спробуйте завантажити файл на пристрій.
              </p>
            </div>
          )}
        </div>

        {/* ua: окрема модалка підтвердження видалення */}
        {showDeleteConfirmation && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-file-title"
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a1d25] p-6 shadow-2xl animate-in zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <FontAwesomeIcon icon={faTrashCan} className="text-lg" />
              </div>

              <h3
                id="delete-file-title"
                className="text-base font-semibold text-white"
              >
                Видалити файл?
              </h3>

              <p className="mt-2 break-words text-sm leading-relaxed text-white/50">
                Ви впевнені, що хочете видалити{' '}
                <span className="font-semibold text-white/80">
                  {file.fileName}
                </span>
                ? Цю дію неможливо скасувати.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setShowDeleteConfirmation(false)}
                  className="rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5 disabled:opacity-50"
                >
                  Скасувати
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex min-w-[105px] items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeleting && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  )}
                  Видалити
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
