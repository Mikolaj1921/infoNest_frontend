// ua: modal store для керування станом модальних вікон

import { create } from 'zustand';
import { DocumentRevision } from '@/types/document';

// ua: типи модальних вікон
export type ModalType =
  | 'createCategory'
  | 'deleteCategory'
  | 'createDocument'
  | 'deleteDocument'
  | 'revisionHistory';

// ua: інтерфейс даних
interface ModalData {
  // Дані для категорій (папок)
  categoryId?: string;
  categoryName?: string;

  // Дані для документів
  documentId?: string;
  documentTitle?: string;
  onSelectRevision?: (revision: DocumentRevision) => void; // колбек для вибору версії документа
}

// ua: інтерфейс стану модального вікна
interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

// ua: створення zustand store для модального вікна
export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data = {}) => set({ isOpen: true, type, data }),
  onClose: () => set({ isOpen: false, type: null, data: {} }),
}));
