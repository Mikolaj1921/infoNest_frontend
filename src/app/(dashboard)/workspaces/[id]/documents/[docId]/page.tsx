// basic structure for the document page

'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor } from '@/features/editor/components/Editor';
import { useDebounce } from '@/hooks/useDebounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faCheckCircle,
  faCircleXmark,
  faSpinner,
  faArrowRotateRight,
} from '@fortawesome/free-solid-svg-icons';

export default function DocumentPage() {
  const serverContentRef = useRef(
    '<h1>New Document</h1><p>Start writing here...</p>',
  );

  const [htmlContent, setHtmlContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'saved' | 'saving' | 'error'>(
    'saved',
  );

  const debouncedContent = useDebounce(htmlContent, 1500);

  // ua: колбек для отримання змін від компонента Editor
  const handleContentChange = (newHtml: string, currentIsDirty: boolean) => {
    setHtmlContent(newHtml);
    setIsDirty(currentIsDirty);

    if (currentIsDirty && syncStatus === 'saved') {
      setSyncStatus('saving');
    }
  };

  useEffect(() => {
    if (debouncedContent === serverContentRef.current) return;

    console.log('Triggering Auto-save', debouncedContent);

    const timer = setTimeout(() => {
      setSyncStatus('saved');
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedContent]);

  const handleSave = () => {
    console.log('Saving content to backend:', htmlContent);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 w-full max-w-5xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-4 text-left">
        <div className="space-y-1">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Document Editor
          </h1>

          <div className="flex items-center gap-1.5 text-xs transition-all duration-300">
            {syncStatus === 'saving' && (
              <span className="flex items-center gap-1 text-primary font-medium animate-pulse">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="h-3 w-3 animate-spin"
                />
                Saving to cloud...
              </span>
            )}

            {syncStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-500 font-medium transition-colors">
                <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                All changes saved
              </span>
            )}

            {syncStatus === 'error' && (
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
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!isDirty} // ua: кнопка заблокована, якщо юзер ще нічого не написав нового
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold shadow-sm transition-all duration-200 shrink-0 ${
            isDirty
              ? 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] cursor-pointer'
              : 'bg-muted/40 text-muted-foreground border border-border/50 cursor-not-allowed opacity-50'
          }`}
        >
          <FontAwesomeIcon icon={faCloudArrowUp} className="h-3.5 w-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      <Editor
        initialContent="<h1>New Document</h1><p>Start writing here...</p>" // тимчасова заглушка до підключення get запиту
        onContentChange={handleContentChange}
      />
    </div>
  );
}
