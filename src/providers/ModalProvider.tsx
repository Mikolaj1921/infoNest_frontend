// ua: провайдер модалок для того, щоб вони були доступні на всіх сторінках та компонентах,
// які знаходяться в межах <ModalProvider>

// аби некст (App Router) не ламався під час рендерингу модалок на сервері (SSR)

'use client';

import { useEffect, useState } from 'react';
import { CreateFolderModal } from '@/components/modals/CreateFolderModal';
import { EditCategoryModal } from '@/components/modals/EditCategoryModal';
import { DeleteCategoryConfirmModal } from '@/components/modals/DeleteCategoryConfirmModal';
// ua: модалки для документів
import { CreateDocumentModal } from '@/components/modals/CreateDocumentModal';
import { DeleteDocumentConfirmModal } from '@/components/modals/DeleteDocumentConfirmModal';
// revision history modal - document versions
import { RevisionHistorySidebar } from '@/components/modals/RevisionHistorySidebar';
// kanban modals
import { EditTaskModal } from '@/components/modals/EditTaskModal';
import { CreateTaskModal } from '@/components/modals/CreateTaskModal';
import { CreateTaskColumnModal } from '@/components/modals/CreateTaskColumnModal';
import { EditTaskColumnModal } from '@/components/modals/EditTaskColumnModal';
import { DeleteTaskConfirmationModal } from '@/components/modals/DeleteTaskConfirmationModal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  // ua: запобігає (Hydration Error) між SSR та Client Side
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateFolderModal />
      <DeleteCategoryConfirmModal />
      <EditCategoryModal />
      <CreateDocumentModal />
      <DeleteDocumentConfirmModal />
      <RevisionHistorySidebar />
      {/*kanban modals*/}
      <CreateTaskModal />
      <EditTaskModal />
      <CreateTaskColumnModal />
      <EditTaskColumnModal />
      <DeleteTaskConfirmationModal />
    </>
  );
};
