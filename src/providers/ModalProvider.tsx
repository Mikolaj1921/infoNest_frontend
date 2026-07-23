// ua: провайдер модалок для того, щоб вони були доступні на всіх сторінках та компонентах,
// які знаходяться в межах <ModalProvider>

// аби некст (App Router) не ламався під час рендерингу модалок на сервері (SSR)

'use client';

import { useEffect, useState } from 'react';
import { CreateFolderModal } from '@/components/modals/CreateFolderModal';
import { DeleteCategoryConfirmModal } from '@/components/modals/DeleteCategoryConfirmModal';

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
    </>
  );
};
