// main doc page
// ua: головна сторінка док, що містить редактор та вкладку з додатками

'use client';

// react & libs
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHistory } from '@fortawesome/free-solid-svg-icons';

// hooks, components, services, modals, stores
import { useDocument } from '@/features/documents/hooks/useDocument';
import { useUpdateDocument } from '@/features/documents/hooks/useUpdateDocument';
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/use-modal-store'; // for revision history modal
import { documentService } from '@/services/document.service';
import { Editor } from '@/features/editor/components/Editor';
import { DocumentAttachments } from '@/features/documents/components/DocumentAttachments';
import type { DocumentRevision, WorkspaceDocument } from '@/types/document';

type SyncStatus = 'saved' | 'unsaved' | 'saving' | 'error';

const DEFAULT_CONTENT = '<h1>New Document</h1><p>Start writing here...</p>';

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { onOpen } = useModal(); // for modal to show revision history

  const docId = String(params.docId ?? params.docid ?? '');

  const { data: document, isLoading, isError, error } = useDocument(docId);

  const [htmlContent, setHtmlContent] = useState(DEFAULT_CONTENT);
  const [title, setTitle] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('saved');
  const [editorInstanceKey, setEditorInstanceKey] = useState(0);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ua: зберігаємо останній вміст, отриманий із сервера
  const serverContentRef = useRef(DEFAULT_CONTENT);

  // ua: не дозволяємо повторному завантаженню кешу перезаписати локальні зміни
  const isDirtyRef = useRef(false);

  // ua: запам'ятовуємо документ, для якого вже ініціалізували редактор
  const initializedDocumentIdRef = useRef<string | null>(null);

  // ua: не запускаємо кілька однакових збережень одночасно
  const saveInProgressRef = useRef(false);

  const debouncedContent = useDebounce(htmlContent, 1500);

  const { mutateAsync: updateDocument, isPending: isSaving } =
    useUpdateDocument(docId, {
      showToast: false,
      onSuccessCb: () => {
        setSyncStatus('saved');
      },
    });

  // ua: ініціалізуємо редактор тільки при першому завантаженні документа
  // ua: повторна відповідь React Query не повинна стирати локальний текст
  useEffect(() => {
    if (!document || initializedDocumentIdRef.current === docId) {
      return;
    }

    const initialContent = document.content || DEFAULT_CONTENT;

    serverContentRef.current = initialContent;
    isDirtyRef.current = false;
    initializedDocumentIdRef.current = docId;

    setHtmlContent(initialContent);
    setTitle(document.title || '');
    setIsDirty(false);
    setSyncStatus('saved');
  }, [document, docId]);

  // ua: відстежуємо зміни в редакторі
  const handleContentChange = useCallback((content: string) => {
    setHtmlContent(content);

    const dirty = content !== serverContentRef.current;

    isDirtyRef.current = dirty;
    setIsDirty(dirty);
    setSyncStatus(dirty ? 'unsaved' : 'saved');
  }, []);

  // ua: автозбереження вмісту після паузи у введенні
  useEffect(() => {
    if (
      !docId ||
      !document ||
      !isDirty ||
      debouncedContent !== htmlContent ||
      saveInProgressRef.current
    ) {
      return;
    }

    if (debouncedContent === serverContentRef.current) {
      isDirtyRef.current = false;
      setIsDirty(false);
      setSyncStatus('saved');
      return;
    }

    let cancelled = false;

    const saveContent = async () => {
      saveInProgressRef.current = true;
      setSyncStatus('saving');

      try {
        const updatedDocument = await updateDocument({
          content: debouncedContent,
        });

        if (cancelled) {
          return;
        }

        // ua: оновлюємо контрольну копію тільки після успішного PATCH
        serverContentRef.current = updatedDocument.content || '';

        // ua: не стираємо зміни, які користувач зробив під час запиту
        const hasNewerChanges =
          isDirtyRef.current && htmlContent !== debouncedContent;

        if (!hasNewerChanges) {
          isDirtyRef.current = false;
          setIsDirty(false);
          setSyncStatus('saved');
        } else {
          setSyncStatus('unsaved');
        }

        queryClient.setQueryData(
          ['document', docId],
          (current: WorkspaceDocument | null | undefined) =>
            current
              ? {
                  ...current,
                  ...updatedDocument,
                  content: updatedDocument.content,
                }
              : updatedDocument,
        );
      } catch {
        if (!cancelled) {
          setSyncStatus('error');
        }
      } finally {
        saveInProgressRef.current = false;
      }
    };

    void saveContent();

    return () => {
      cancelled = true;
    };
  }, [
    docId,
    document,
    isDirty,
    debouncedContent,
    htmlContent,
    updateDocument,
    queryClient,
  ]);

  // ua: ручне збереження заголовка документа
  const handleTitleSave = async () => {
    if (!docId || !document || title.trim() === '') {
      toast.error('Document title cannot be empty');
      return;
    }

    if (title === document.title) {
      return;
    }

    try {
      const updatedDocument = await updateDocument({
        title: title.trim(),
      });

      queryClient.setQueryData(['document', docId], updatedDocument);

      toast.success('Document title saved');
    } catch {
      // ua: помилку обробляє useUpdateDocument
    }
  };

  // ua: видалення документа
  const handleDeleteDocument = async () => {
    if (!docId) {
      return;
    }

    setIsDeleting(true);

    try {
      await documentService.deleteDocument(docId);

      await queryClient.invalidateQueries({
        queryKey: ['workspace-structure'],
      });

      await queryClient.invalidateQueries({
        queryKey: ['document', docId],
      });

      toast.success('Document deleted');

      router.back();
    } catch {
      // ua: помилку обробляємо через повідомлення для користувача
      toast.error('Failed to delete document');
    } finally {
      setIsDeleting(false);
      setIsDeleteOpen(false);
    }
  };

  // ua: відновлення вмісту з вибраної версії
  const handleRestoreRevision = (revision: DocumentRevision) => {
    const restoredContent = revision.content || '';

    setHtmlContent(restoredContent);

    const dirty = restoredContent !== serverContentRef.current;

    isDirtyRef.current = dirty;
    setIsDirty(dirty);
    setSyncStatus(dirty ? 'unsaved' : 'saved');

    // ua: перемонтовуємо редактор, щоб він отримав відновлений вміст
    setEditorInstanceKey((current) => current + 1);
  };

  if (isLoading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-gray-500">Loading document...</p>
      </main>
    );
  }

  if (isError || !document) {
    return (
      <main className="mx-auto max-w-3xl p-8">
        <h1 className="text-xl font-semibold">Unable to load document</h1>
        <p className="mt-2 text-sm text-gray-500">
          {error instanceof Error
            ? error.message
            : 'The document was not found or you do not have access to it.'}
        </p>
        <button
          type="button"
          onClick={() => router.back()}
          className="mt-4 rounded-md border px-4 py-2 text-sm"
        >
          Go back
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => {
              if (title.trim() && title !== document.title) {
                void handleTitleSave();
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
            }}
            aria-label="Document title"
            className="w-full border-0 bg-transparent text-2xl font-semibold outline-none focus:ring-0"
            placeholder="Document title"
          />

          <p className="mt-1 text-xs text-gray-500">
            Last updated{' '}
            {formatDistanceToNow(new Date(document.updatedAt), {
              addSuffix: true,
              locale: enUS,
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-sm ${
              syncStatus === 'error'
                ? 'text-red-600'
                : syncStatus === 'saved'
                  ? 'text-green-600'
                  : 'text-gray-500'
            }`}
            role="status"
            aria-live="polite"
          >
            {syncStatus === 'saving' || isSaving
              ? 'Saving...'
              : syncStatus === 'unsaved'
                ? 'Unsaved changes'
                : syncStatus === 'error'
                  ? 'Save failed'
                  : 'All changes saved'}
          </span>

          {/*revision history*/}
          <button
            type="button"
            onClick={() =>
              onOpen('revisionHistory', {
                documentId: docId,
                currentContent: htmlContent,
                onSelectRevision: handleRestoreRevision,
              })
            }
            className="rounded-md border px-3 py-2 text-sm hover:bg-accent/20"
          >
            <FontAwesomeIcon icon={faHistory} className="mr-2" />
            Version history
          </button>

          <button
            type="button"
            onClick={() => setIsDeleteOpen(true)}
            className="rounded-md border px-3 py-2 text-sm text-red-600 hover:bg-accent/20 hover:bg-destructive/5"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-2" />
            Delete
          </button>
        </div>
      </header>

      <section className="min-h-[60vh] overflow-hidden rounded-xl border border-[#252833] bg-[#090b10]">
        <Editor
          key={`${docId}-${editorInstanceKey}`}
          documentId={docId}
          initialContent={htmlContent}
          onContentChange={handleContentChange}
          editable
        />
      </section>

      <section className="rounded-xl border border-[#252833] bg-[#090b10] p-4">
        <h2 className="mb-3 border-b border-[#252833] pb-3 text-lg font-semibold text-white">
          Attachments
        </h2>
        <DocumentAttachments documentId={docId} />
      </section>

      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-document-title"
            className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#252833] bg-[#090b10] p-6 text-white shadow-xl"
          >
            <h2 id="delete-document-title" className="text-lg font-semibold">
              Delete document?
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteOpen(false)}
                className="rounded-md border px-4 py-2 text-sm hover:bg-accent/20 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDeleteDocument()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
