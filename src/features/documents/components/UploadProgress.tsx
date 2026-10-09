// progress bar for file upload (тимчасовий файл - до фіксу стилізації)

'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faArrowUpFromBracket,
} from '@fortawesome/free-solid-svg-icons';

// props for the UploadProgress component
interface UploadProgressProps {
  fileName: string;
  progress: number;
}

export const UploadProgress = ({ fileName, progress }: UploadProgressProps) => {
  return (
    <div className="w-full max-w-md rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-200 select-none text-left">
      {/*хедер індикатора завантаження */}
      <div className="flex items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 animate-pulse">
            <FontAwesomeIcon
              icon={faArrowUpFromBracket}
              className="h-3.5 w-3.5"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs font-bold text-foreground/90 truncate"
              title={fileName}
            >
              {fileName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium">
              Uploading...
            </span>
          </div>
        </div>

        {/* індикатор відсотків */}
        <span className="text-xs font-bold text-primary shrink-0 flex items-center gap-1.5">
          <FontAwesomeIcon icon={faSpinner} className="h-3 w-3 animate-spin" />
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden border border-border/10">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
