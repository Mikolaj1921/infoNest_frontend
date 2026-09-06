'use client';

import { useEffect } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { useDocumentRevisions } from '@/features/documents/hooks/useDocumentRevisions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faClockRotateLeft,
  faUser,
  faSpinner,
  faFileCode,
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import Image from 'next/image';

export const RevisionHistorySidebar = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { documentId } = data || {};

  const isSidebarOpen = isOpen && type === 'revisionHistory';

  const {
    data: revisions,
    isLoading,
    isError,
    refetch,
  } = useDocumentRevisions(documentId || '');

  useEffect(() => {
    if (isSidebarOpen && documentId) {
      refetch();
    }
  }, [isSidebarOpen, documentId, refetch]);

  if (!isSidebarOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/*задній фон закриває панель */}
      <div className="flex-1" onClick={onClose} />

      {/* конт висувної бічної панелі */}
      <div className="w-full max-w-md h-full bg-card border-l border-border p-6 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-left">
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className="text-primary h-4 w-4"
            />
            <h2 className="text-lg font-bold text-foreground">
              Version History
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-accent transition cursor-pointer"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* контент */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-4">
          {isLoading && (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-5 w-5 animate-spin text-primary"
              />
              <p className="text-xs">Loading document history...</p>
            </div>
          )}

          {isError && (
            <div className="h-40 flex flex-col items-center justify-center gap-1 text-destructive p-4 text-center">
              <p className="text-xs font-bold">Failed to load history</p>
              <p className="text-[11px] opacity-80">
                Please check your connection and try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && (!revisions || revisions.length === 0) && (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground/50 italic text-center">
              <p className="text-xs">No saved versions found</p>
            </div>
          )}

          {/* список ревізій */}
          {!isLoading && !isError && revisions && revisions.length > 0 && (
            <div className="space-y-2">
              {[...revisions].reverse().map((revision, index) => {
                const isLatest = index === 0;
                return (
                  <button
                    key={revision.id}
                    onClick={() => {
                      console.log('Клік на перегляд ревізії:', revision.id);
                    }}
                    className="w-full text-left rounded-xl p-3 border border-border/40 bg-background/40 hover:bg-accent/40 hover:border-primary/30 transition-all group flex flex-col gap-2 cursor-pointer focus:outline-none"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                          isLatest
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {isLatest
                          ? 'Current Version'
                          : `v.${revisions.length - index}`}
                      </span>
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(revision.createdAt), {
                          addSuffix: true,
                          locale: uk,
                        })}
                      </span>
                    </div>

                    {/* інфо про редактора версії */}
                    <div className="flex items-center gap-2 pt-1 border-t border-border/20 mt-1">
                      {revision.editor.avatarUrl ? (
                        <Image
                          src={revision.editor.avatarUrl}
                          alt={revision.editor.name}
                          width={16}
                          height={16}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-[8px] text-primary"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors">
                          {revision.editor.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">
                          {revision.editor.email}
                        </span>
                      </div>
                    </div>

                    {/* прев'ю мітки */}
                    <div className="text-[10px] text-muted-foreground/50 flex items-center gap-1.5 mt-0.5">
                      <FontAwesomeIcon
                        icon={faFileCode}
                        className="text-[9px]"
                      />
                      <span>Snapshot data captured</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
