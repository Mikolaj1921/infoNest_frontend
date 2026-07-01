// basic structure for the document page

'use client';

import { useState } from 'react';
import { Editor } from '@/features/editor/components/Editor';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCloudArrowUp,
  faCheckCircle,
  faCircleXmark,
} from '@fortawesome/free-solid-svg-icons';

export default function DocumentPage() {
  const [htmlContent, setHtmlContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // ua: колбек для отримання змін від компонента Editor
  const handleContentChange = (newHtml: string, currentIsDirty: boolean) => {
    setHtmlContent(newHtml);
    setIsDirty(currentIsDirty);
  };

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

          <div className="flex items-center gap-1.5 text-xs">
            {isDirty ? (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <FontAwesomeIcon
                  icon={faCircleXmark}
                  className="h-3 w-3 animate-pulse"
                />
                Unsaved changes
              </span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <FontAwesomeIcon icon={faCheckCircle} className="h-3 w-3" />
                All changes saved
              </span>
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
