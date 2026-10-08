'use client';

import React, { useState } from 'react';
import { useDocumentFiles } from '../hooks/useDocumentFiles';
import { formatBytes } from '@/utils/file-format';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPaperclip,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFileArchive,
  faFileAlt,
  faTrashCan,
  faSpinner,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useQueryClient } from '@tanstack/react-query';
import { fileService } from '@/services/file.service';
import { toast } from 'sonner';

interface DocumentAttachmentsProps {
  documentId: string;
}

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return faFilePdf;
    case 'doc':
    case 'docx':
      return faFileWord;
    case 'xls':
    case 'xlsx':
    case 'csv':
      return faFileExcel;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return faFileImage;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
      return faFileArchive;
    default:
      return faFileAlt;
  }
};

export const DocumentAttachments = ({
  documentId,
}: DocumentAttachmentsProps) => {
  const queryClient = useQueryClient();
  const { data: files, isLoading, isError } = useDocumentFiles(documentId);

  // ua: локал стейт для збереження URL картинки та яка передається через лайтбокс
  const [activePreviewImage, setActivePreviewImage] = useState<{
    url: string;
    name: string;
  } | null>(null);

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await fileService.deleteFile(fileId);
      toast.success('Файл успішно видалено');
      queryClient.invalidateQueries({
        queryKey: ['document-files', documentId],
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Не вдалося видалити файл');
    }
  };

  // ua: обробник кліку на картку файлу (лайтбокс або скачування)
  const handleFileClick = (fileUrl: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(
      extension || '',
    );

    if (isImage) {
      setActivePreviewImage({ url: fileUrl, name: fileName });
    } else {
      // інший файл - відкриваємо/скачуємо в новій вкладці через р2 лінк
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div className="pt-6 border-t border-border/40 text-left flex items-center gap-2 text-xs text-muted-foreground">
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
      <div className="pt-6 border-t border-border/40 text-left text-xs text-destructive font-medium">
        Failed to load attachments for this document.
      </div>
    );
  }

  return (
    <div className="pt-8 border-t border-border/40 text-left space-y-4 w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground/90">
        <FontAwesomeIcon
          icon={faPaperclip}
          className="h-3.5 w-3.5 text-muted-foreground/70"
        />
        <span>Attachments</span>
        {files && files.length > 0 && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground font-semibold">
            {files.length}
          </span>
        )}
      </div>

      {(!files || files.length === 0) && (
        <p className="text-xs italic text-muted-foreground/60 pl-1">
          No files attached to this document yet.
        </p>
      )}

      {files && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {files.map((file) => (
            <div
              key={file.id}
              onClick={() => handleFileClick(file.url, file.fileName)}
              className="group relative flex items-center justify-between rounded-xl border border-border/50 bg-background/50 p-3 hover:bg-accent/40 hover:border-primary/20 transition-all duration-200 cursor-pointer select-none"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="h-9 w-9 rounded-lg bg-secondary/60 flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 transition-colors shrink-0 border border-border/10">
                  <FontAwesomeIcon
                    icon={getFileIcon(file.fileName)}
                    className="h-4 w-4"
                  />
                </div>
                <div className="flex flex-col min-w-0 space-y-0.5">
                  <span
                    className="text-xs font-semibold text-foreground/90 truncate group-hover:text-primary transition-colors"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </span>
                  <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5">
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
                onClick={(e) => handleDeleteFile(e, file.id)}
                className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200 cursor-pointer shrink-0 ml-2"
                title="Видалити файл"
              >
                <FontAwesomeIcon icon={faTrashCan} className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* модалка */}
      {activePreviewImage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActivePreviewImage(null)}
        >
          {/* Кнопка закриття та назва файлу зверху */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10">
            <span className="text-sm font-semibold truncate max-w-[80%] opacity-80">
              {activePreviewImage.name}
            </span>
            <button
              onClick={() => setActivePreviewImage(null)}
              className="h-9 w-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
            >
              <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
            </button>
          </div>

          {/* картинка */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activePreviewImage.url}
            alt={activePreviewImage.name}
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200 select-none"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};
