'use client';

import { useEffect, useState } from 'react';
import { useModal } from '@/hooks/use-modal-store';
import { useDocumentRevisions } from '@/features/documents/hooks/useDocumentRevisions';
import type { DocumentRevision } from '@/types/document';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faXmark,
  faClockRotateLeft,
  faUser,
  faSpinner,
  faFileCode,
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import Image from 'next/image';

// ua: тип вибраної версії для попереднього перегляду
type SelectedVersion =
  | { type: 'current' }
  | { type: 'revision'; revision: DocumentRevision }
  | null;

// ua: вміст панелі історії ревізій
interface RevisionHistoryContentProps {
  revisions: DocumentRevision[] | undefined;
  currentContent: string;
  isLoading: boolean;
  isError: boolean;
  onClose: () => void;
  onSelectRevision?: (revision: DocumentRevision) => void;
}

const RevisionHistoryContent = ({
  revisions,
  currentContent,
  isLoading,
  isError,
  onClose,
  onSelectRevision,
}: RevisionHistoryContentProps) => {
  const [selectedVersion, setSelectedVersion] = useState<SelectedVersion>(null);

  // ua: відновлюємо вибрану попередню версію в редакторі документа
  const handleRestoreRevision = () => {
    if (
      !selectedVersion ||
      selectedVersion.type !== 'revision' ||
      !onSelectRevision
    ) {
      return;
    }

    onSelectRevision(selectedVersion.revision);
    onClose();
  };

  // ua: перевіряємо, чи вибрана поточна версія
  const isCurrentSelected = selectedVersion?.type === 'current';

  // ua: список ревізій - від нових до старих
  const orderedRevisions = revisions ?? [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      {/* задній фон закриває панель */}
      <div className="flex-1" onClick={onClose} />

      {/* конт висувної бічної панелі */}
      <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-card p-6 text-left shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-4">
          <div className="flex items-center gap-2">
            <FontAwesomeIcon
              icon={faClockRotateLeft}
              className="h-4 w-4 text-primary"
            />
            <h2 className="text-lg font-bold text-foreground">
              Version History
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close version history"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground/60 hover:bg-accent hover:text-foreground"
          >
            <FontAwesomeIcon icon={faXmark} className="h-4 w-4" />
          </button>
        </div>

        {/* контент */}
        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
          {isLoading && (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <FontAwesomeIcon
                icon={faSpinner}
                className="h-5 w-5 animate-spin text-primary"
              />
              <p className="text-xs">Loading document history...</p>
            </div>
          )}

          {isError && (
            <div className="flex h-40 flex-col items-center justify-center gap-1 p-4 text-center text-destructive">
              <p className="text-xs font-bold">Failed to load history</p>
              <p className="text-[11px] opacity-80">
                Please check your connection and try again.
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <>
              {/* ua: актуальна версія документа */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedVersion((current) =>
                      current?.type === 'current' ? null : { type: 'current' },
                    )
                  }
                  aria-pressed={isCurrentSelected}
                  className={`group flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                    isCurrentSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/30 bg-primary/[0.03] hover:border-primary/60 hover:bg-primary/5'
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="rounded border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                      Current Version
                    </span>

                    <span className="text-[10px] text-muted-foreground/60">
                      Currently in editor
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-2 border-t border-border/20 pt-2">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full border border-primary/10 bg-primary/10">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-[8px] text-primary"
                      />
                    </div>

                    <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary">
                      Current document content
                    </span>
                  </div>

                  <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                    <FontAwesomeIcon icon={faFileCode} className="text-[9px]" />
                    <span>Latest editor content</span>
                  </div>
                </button>

                {/* ua: попередній перегляд актуального вмісту */}
                {isCurrentSelected && (
                  <div className="space-y-3 rounded-xl border border-primary/20 bg-background/60 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                    <h3 className="text-sm font-semibold text-foreground">
                      Current version preview
                    </h3>

                    <div
                      className="prose prose-sm dark:prose-invert max-h-64 max-w-none overflow-y-auto rounded-lg border border-border bg-background p-4 text-foreground"
                      dangerouslySetInnerHTML={{
                        __html: currentContent,
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => setSelectedVersion(null)}
                      className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                    >
                      Close preview
                    </button>
                  </div>
                )}
              </div>

              {/* ua: список попередніх ревізій */}
              {orderedRevisions.length > 0 ? (
                <div className="space-y-2">
                  <div className="border-b border-border/40 pb-2 pt-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Previous Versions
                    </h3>
                  </div>

                  {orderedRevisions.map((revision, index) => {
                    const isSelected =
                      selectedVersion?.type === 'revision' &&
                      selectedVersion.revision.id === revision.id;

                    const versionNumber = orderedRevisions.length - index;

                    return (
                      <div key={revision.id} className="space-y-2">
                        {/* картка попередньої версії */}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedVersion((current) =>
                              current?.type === 'revision' &&
                              current.revision.id === revision.id
                                ? null
                                : { type: 'revision', revision },
                            )
                          }
                          aria-pressed={isSelected}
                          className={`group flex w-full cursor-pointer flex-col gap-2 rounded-xl border p-3 text-left transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : 'border-border/40 bg-background/40 hover:border-primary/30 hover:bg-accent/40'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="rounded bg-secondary px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                              v.{versionNumber}
                            </span>

                            <span className="text-[10px] text-muted-foreground/60">
                              {formatDistanceToNow(
                                new Date(revision.createdAt),
                                {
                                  addSuffix: true,
                                  locale: enUS,
                                },
                              )}
                            </span>
                          </div>

                          {/* інфо про редактора версії */}
                          <div className="mt-1 flex items-center gap-2 border-t border-border/20 pt-2">
                            {revision.editor?.avatarUrl ? (
                              <Image
                                src={revision.editor.avatarUrl}
                                alt={revision.editor.name || 'Editor'}
                                width={16}
                                height={16}
                                className="rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-4 w-4 items-center justify-center rounded-full border border-primary/10 bg-primary/10">
                                <FontAwesomeIcon
                                  icon={faUser}
                                  className="text-[8px] text-primary"
                                />
                              </div>
                            )}

                            <div className="flex min-w-0 flex-col">
                              <span className="text-xs font-semibold text-foreground/90 group-hover:text-primary">
                                {revision.editor?.name || 'Unknown editor'}
                              </span>
                              <span className="max-w-[200px] truncate text-[10px] text-muted-foreground/60">
                                {revision.editor?.email || ''}
                              </span>
                            </div>
                          </div>

                          {/* прев'ю мітки */}
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
                            <FontAwesomeIcon
                              icon={faFileCode}
                              className="text-[9px]"
                            />
                            <span>Snapshot data captured</span>
                          </div>
                        </button>

                        {/* ua: попередній перегляд одразу під вибраною версією */}
                        {isSelected && (
                          <div className="space-y-3 rounded-xl border border-primary/20 bg-background/60 p-3 animate-in fade-in slide-in-from-top-1 duration-200">
                            <h3 className="text-sm font-semibold text-foreground">
                              Version {versionNumber} preview
                            </h3>

                            <div
                              className="prose prose-sm dark:prose-invert max-h-64 max-w-none overflow-y-auto rounded-lg border border-border bg-background p-4 text-foreground"
                              dangerouslySetInnerHTML={{
                                __html: revision.content || '',
                              }}
                            />

                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={handleRestoreRevision}
                                disabled={!onSelectRevision}
                                className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Restore to editor
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedVersion(null)}
                                className="cursor-pointer rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex h-24 flex-col items-center justify-center gap-2 text-center italic text-muted-foreground/50">
                  <p className="text-xs">No previous versions found</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const RevisionHistorySidebar = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { documentId, currentContent, onSelectRevision } = data || {};

  const isSidebarOpen = isOpen && type === 'revisionHistory';

  const {
    data: revisions,
    isLoading,
    isError,
    refetch,
  } = useDocumentRevisions(documentId || '');

  // ua: завантажуємо історію при відкритті панелі
  useEffect(() => {
    if (isSidebarOpen && documentId) {
      void refetch();
    }
  }, [isSidebarOpen, documentId, refetch]);

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <RevisionHistoryContent
      key={documentId}
      revisions={revisions}
      currentContent={currentContent || ''}
      isLoading={isLoading}
      isError={isError}
      onClose={onClose}
      onSelectRevision={onSelectRevision}
    />
  );
};
