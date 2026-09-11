'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';

// ua: Головний компонент сторінки воркспейсу. Ключове слово export default є ОБОВ'ЯЗКОВИМ!
export default function WorkspacePage() {
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 h-full bg-background animate-in fade-in duration-300 text-center">
      <div className="max-w-md space-y-4">
        {/* Красива заглушка робочої зони воркспейсу */}
        <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
          <FontAwesomeIcon icon={faFolderOpen} className="h-5 w-5" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Ласкаво просимо до вашого воркспейсу!
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Оберіть існуючий документ у сайдбарі ліворуч або створіть нову
            папку, щоб почати структурувати свої знання.
          </p>
        </div>

        <div className="pt-2 text-[11px] text-muted-foreground/40 font-mono">
          Workspace ID: {workspaceId}
        </div>
      </div>
    </div>
  );
}
