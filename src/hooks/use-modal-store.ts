// ua: modal store для керування станом модальних вікон

import { create } from 'zustand';

// ua: типи модальних вікон
export type ModalType = 'createCategory' | 'deleteCategory';

// ua: інтерфейс даних
interface ModalData {
  categoryName?: string;
  categoryId?: string;
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
