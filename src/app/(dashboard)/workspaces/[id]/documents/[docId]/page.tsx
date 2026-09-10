// basic structure for the document page

'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Editor } from '@/features/editor/components/Editor';
// hooks
import { useDebounce } from '@/hooks/useDebounce';
import { useModal } from '@/hooks/use-modal-store';
// fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faCheckCircle,
  faCircleXmark,
  faSpinner,
  faArrowRotateRight,
  faTrashCan,
  faUser,
  faEye,
  faLock,
  faClockRotateLeft,
  faEyeSlash,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { DocumentVisibility, DocumentRevision } from '@/types/document';

const MOCK_UPDATED_AT = new Date(Date.now() - 1000 * 60 * 120).toISOString();

export default function DocumentPage() {
  const params = useParams();
  const docId = typeof params?.docId === 'string' ? params.docId : '';

  const { onOpen } = useModal(); // ua: підкл відкриття модалок

  const serverContentRef = useRef(
    '<h1>New Document</h1><p>Start writing here...</p>',
  );

  const [htmlContent, setHtmlContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error'>(
    'saved',
  );
  const [selectedRevision, setSelectedRevision] =
    useState<DocumentRevision | null>(null);

  const mockDocument = {
    id: docId,
    title: 'Document Editor',
    updatedAt: MOCK_UPDATED_AT,
    visibility: DocumentVisibility.PRIVATE,
    owner: {
      name: 'Олексій Коваленко',
      avatarUrl: undefined,
    },
  };

  const debouncedContent = useDebounce(htmlContent, 1500);

  // ua: колбек для отримання змін від компонента Editor
  const handleContentChange = (newHtml: string, currentIsDirty: boolean) => {
    if (selectedRevision) return; // блокуємо зміни в режимі перегляду ревізії
    setHtmlContent(newHtml);
    setIsDirty(currentIsDirty);

    if (currentIsDirty && syncStatus === 'saved') {
      setSyncStatus('saving');
    }
  };

  useEffect(() => {
    if (selectedRevision) return;
    if (debouncedContent === serverContentRef.current) return;

    console.log('Triggering Auto-save', debouncedContent);

    const timer = setTimeout(() => {
      setSyncStatus('saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedContent, selectedRevision]);

  const handleSave = () => {
    if (selectedRevision) return;
    console.log('Saving content to backend:', htmlContent);
  };

  const handleOpenHistory = () => {
    onOpen('revisionHistory', {
      documentId: docId,
      documentTitle: mockDocument.title,
      onSelectRevision: (revision) => {
        setSelectedRevision(revision);
      },
    });
  };

  const handleExitPreview = () => {
    setSelectedRevision(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-5xl mx-auto p-4">
      {/* Плашка-попередження режиму перегляду старої ревізії */}
      {selectedRevision && (
        <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-amber-500">
                Ви переглядаєте стару версію документа
              </p>
              <p className="text-xs text-muted-foreground">
                Збережена{' '}
                {formatDistanceToNow(new Date(selectedRevision.createdAt), {
                  addSuffix: true,
                  locale: uk,
                })}{' '}
                користувачем{' '}
                <span className="font-semibold text-foreground">
                  {selectedRevision.editor.name}
                </span>
                . Редагування тимчасово вимкнено.
              </p>
            </div>
          </div>
          <button
            onClick={handleExitPreview}
            className="flex items-center gap-2 rounded-xl bg-amber-500 text-black font-bold px-4 py-2 text-xs shadow-sm hover:bg-amber-400 active:scale-[0.98] transition cursor-pointer shrink-0"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="text-[10px]" />
            <span>Повернутися до актуальної версії</span>
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {mockDocument.title}
          </h1>

          <div className="flex items-center gap-1.5 text-xs transition-all duration-300">
            {syncStatus === 'saving' && !selectedRevision && (
              <span className="flex items-center gap-1 text-primary font-medium animate-pulse">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-3 w-3 animate-spin"
                />
                Saving to cloud...
              </span>
            )}

            {syncStatus === 'saved' && !selectedRevision && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium transition-colors">
                <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                All changes saved
              </span>
            )}

            {syncStatus === 'error' && !selectedRevision && (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-destructive font-bold transition-colors">
                  <FontAwesomeIcon icon={faCircleXmark} className="h-3 w-3" />
                  Error syncing data
                </span>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 rounded bg-destructive/10 px-2 py-0.5 text-[10px] font-bold text-destructive hover:bg-destructive/20 cursor-pointer transition-colors"
                >
                  <FontAwesomeIcon
                    icon={faArrowRotateRight}
                    className="text-[9px]"
                  />
                  <span>Try manually</span>
                </button>
              </div>
            )}

            {selectedRevision && (
              <span className="text-amber-500 font-medium text-xs">
                Режим перегляду історії змін
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-muted-foreground/80">
            <div className="flex items-center gap-1.5 bg-secondary/30 px-2.5 py-1 rounded-md border border-border/20">
              {mockDocument.owner.avatarUrl ? (
                <Image
                  src={mockDocument.owner.avatarUrl}
                  alt={mockDocument.owner.name}
                  width={14}
                  height={14}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-[8px] text-primary"
                  />
                </div>
              )}
              <span className="font-medium text-foreground/90">
                {mockDocument.owner.name}
              </span>
            </div>
            <span className="text-muted-foreground/30">•</span>
            <span title={mockDocument.updatedAt}>
              Оновлено{' '}
              {formatDistanceToNow(new Date(mockDocument.updatedAt), {
                addSuffix: true,
                locale: uk,
              })}
            </span>
            <span className="text-muted-foreground/30">•</span>
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
                mockDocument.visibility === DocumentVisibility.PUBLIC
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              }`}
            >
              <FontAwesomeIcon
                icon={
                  mockDocument.visibility === DocumentVisibility.PUBLIC
                    ? faEye
                    : faLock
                }
                className="text-[10px]"
              />
              <span className="uppercase tracking-wider">
                {mockDocument.visibility}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Кнопка відкриття історії змін документа */}
          <button
            type="button"
            onClick={handleOpenHistory}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground/80 hover:text-foreground hover:bg-accent/40 border border-border/60 transition-all duration-200 cursor-pointer"
            title="Історія змін"
          >
            <FontAwesomeIcon icon={faClockRotateLeft} className="h-3.5 w-3.5" />
            <span>History</span>
          </button>

          {/* видалення активного документа */}
          <button
            type="button"
            onClick={() =>
              onOpen('deleteDocument', {
                documentId: docId,
                documentTitle: mockDocument.title,
              })
            }
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-muted-foreground/80 hover:text-destructive hover:bg-destructive/10 border border-border/60 hover:border-destructive/20 transition-all duration-200 cursor-pointer"
            title="Видалити цей документ"
          >
            <FontAwesomeIcon icon={faTrashCan} className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>

          {/*  manual збереження */}
          <button
            onClick={handleSave}
            disabled={!isDirty} // ua: кнопка заблокована, якщо юзер ще нічого не написав нового
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all duration-200 ${
              isDirty
                ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] cursor-pointer'
                : 'bg-muted/40 text-muted-foreground border border-border/50 cursor-not-allowed opacity-50'
            }`}
          >
            <FontAwesomeIcon icon={faCloudArrowUp} className="h-3.5 w-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>

      <Editor
        initialContent="<h1>New Document</h1><p>Start writing here...</p>" // тимчасова заглушка до підключення get запиту
        onContentChange={handleContentChange}
      />
    </div>
  );
}
