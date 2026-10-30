'use client';

import React, { useState, useRef } from 'react';
import { useDocumentFiles } from '../hooks/useDocumentFiles';
import { formatBytes } from '@/utils/file-format';
import { validateUploadedFile } from '@/utils/file-validator';
import { UploadProgress } from './UploadProgress';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperclip,
  faFilePdf,
  faFileImage,
  faTrashCan,
  faSpinner,
  faArrowUpFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { useQueryClient } from '@tanstack/react-query';
import { fileService } from '@/services/file.service';
import { FileAttachment } from '@/types/document';
import { toast } from 'sonner';

interface DocumentAttachmentsProps {
  documentId: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') return faFilePdf;

  return faFileImage;
};

const isSupportedFile = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  return (
    extension === 'pdf' ||
    ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'avif'].includes(
      extension || '',
    )
  );
};

export const DocumentAttachments = ({
  documentId,
}: DocumentAttachmentsProps) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: files, isLoading, isError } = useDocumentFiles(documentId);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<{
    fileName: string;
    progress: number;
  } | null>(null);

  const [selectedFile, setSelectedFile] = useState<FileAttachment | null>(null);

  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);

  // ua: видалення файлу
  const handleDeleteFile = async (fileId: string): Promise<boolean> => {
    if (deletingFileId) return false;

    setDeletingFileId(fileId);

    try {
      await fileService.deleteFile(fileId);

      toast.success('Файл успішно видалено');

      setSelectedFile(null);

      await queryClient.invalidateQueries({
        queryKey: ['document-files', documentId],
      });

      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Не вдалося видалити файл');
      return false;
    } finally {
      setDeletingFileId(null);
    }
  };

  // ua: відкриття файлу в модальному вікні
  const handleFileClick = (file: FileAttachment) => {
    if (!isSupportedFile(file.fileName)) {
      toast.error('Цей формат файлу не підтримується для перегляду.');
      return;
    }

    setSelectedFile(file);
  };

  // ua: завантаження файлу
  const processFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || uploadState) return;

    // ua: наразі підтримується завантаження одного файлу за раз
    const file = fileList[0];

    const validation = validateUploadedFile(file);

    if (!validation.isValid) {
      toast.error(validation.error || 'Помилка валідації файлу');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      return;
    }

    setUploadState({
      fileName: file.name,
      progress: 0,
    });

    try {
      await fileService.uploadFile(documentId, file, (percent) => {
        setUploadState((prev) =>
          prev ? { ...prev, progress: percent } : null,
        );
      });

      toast.success('Файл успішно завантажено');

      await queryClient.invalidateQueries({
        queryKey: ['document-files', documentId],
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Не вдалося завантажити файл');
    } finally {
      setUploadState(null);

      // ua: дозволяємо повторно вибрати той самий файл
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!uploadState) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!uploadState) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleTriggerFileInput = () => {
    if (!uploadState) {
      fileInputRef.current?.click();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 border-t border-border/40 pt-6 text-left text-xs text-muted-foreground">
        <FontAwesomeIcon
          icon={faSpinner}
          className="h-3.5 w-3.5 animate-spin text-primary"
        />
        <span>Loading attachments...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="border-t border-border/40 pt-6 text-left text-xs font-medium text-destructive">
        Failed to load attachments for this document.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 border-t border-border/40 pt-8 text-left animate-in fade-in duration-300">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,application/pdf"
        onChange={(e) => processFiles(e.target.files)}
        className="hidden"
        disabled={!!uploadState}
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-bold text-foreground/90">
          <FontAwesomeIcon
            icon={faPaperclip}
            className="h-3.5 w-3.5 text-muted-foreground/70"
          />

          <span>Attachments</span>

          {files && files.length > 0 && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {files.length}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={!!uploadState}
          onClick={handleTriggerFileInput}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FontAwesomeIcon
            icon={faArrowUpFromBracket}
            className="text-[11px]"
          />
          <span>Upload File</span>
        </button>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleTriggerFileInput}
        className={`flex min-h-[110px] w-full cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 transition-all duration-200 ${
          isDragging
            ? 'scale-[0.995] border-primary bg-primary/5 shadow-inner'
            : 'border-border/60 bg-background/20 hover:border-primary/30 hover:bg-accent/10'
        }`}
      >
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-200 ${
            isDragging ? 'scale-110 text-primary' : 'text-muted-foreground/50'
          }`}
        >
          <FontAwesomeIcon icon={faArrowUpFromBracket} className="h-4 w-4" />
        </div>

        <div className="space-y-1 text-center">
          <p className="text-xs font-bold text-foreground/80">
            {isDragging
              ? 'Drop file here to upload'
              : 'Drag and drop file here, or click to browse'}
          </p>

          <p className="text-[10px] font-medium text-muted-foreground">
            Дозволено завантажувати лише PDF-файли та зображення. Максимальний
            розмір — 5 MB.
          </p>
        </div>
      </div>

      {uploadState && (
        <div className="flex justify-start pt-1">
          <UploadProgress
            fileName={uploadState.fileName}
            progress={uploadState.progress}
          />
        </div>
      )}

      {(!files || files.length === 0) && !uploadState && (
        <p className="pl-1 text-xs italic text-muted-foreground/60">
          No files attached to this document yet.
        </p>
      )}

      {files && files.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleFileClick(file);
                }
              }}
              role="button"
              tabIndex={0}
              className="group relative flex cursor-pointer select-none items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-accent/40"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/10 bg-secondary/60 text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary">
                  <FontAwesomeIcon
                    icon={getFileIcon(file.fileName)}
                    className="h-4 w-4"
                  />
                </div>

                <div className="flex min-w-0 flex-col space-y-0.5">
                  <span
                    className="truncate text-xs font-semibold text-foreground/90 transition-colors group-hover:text-primary"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </span>

                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70">
                    <span>{formatBytes(file.size)}</span>
                    <span className="text-muted-foreground/30">•</span>
                    <span>
                      {formatDistanceToNow(new Date(file.createdAt), {
                        addSuffix: true,
                        locale: uk,
                      })}
                    </span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleDeleteFile(file.id);
                }}
                disabled={deletingFileId === file.id}
                className="ml-2 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-lg text-muted-foreground/40 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive focus:opacity-100 group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Видалити файл"
              >
                {deletingFileId === file.id ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="h-3 w-3 animate-spin"
                  />
                ) : (
                  <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <DocumentPreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDelete={handleDeleteFile}
          isDeleting={deletingFileId === selectedFile.id}
        />
      )}
    </div>
  );
};
