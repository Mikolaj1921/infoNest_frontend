// ai tests - custom hook useModalStore
// ua: хук відповідає за стан модальних вікон

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useModal } from './use-modal-store';
import type { ModalType } from './use-modal-store';
import type { DocumentRevision } from '@/types/document';

describe('useModal', () => {
  // ua: скидаємо стан перед кожним тестом
  beforeEach(() => {
    useModal.setState({
      type: null,
      data: {},
      isOpen: false,
    });
  });

  // ua: 1. Перевірка початкового стану
  it('1. Повинен мати початковий стан закритого модального вікна', () => {
    const state = useModal.getState();

    expect(state.type).toBeNull();
    expect(state.data).toEqual({});
    expect(state.isOpen).toBe(false);
    expect(typeof state.onOpen).toBe('function');
    expect(typeof state.onClose).toBe('function');
  });

  // ua: 2. Відкриття модального вікна
  it('2. Повинен відкривати модальне вікно з переданим типом', () => {
    const { onOpen } = useModal.getState();

    onOpen('createCategory');

    const state = useModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('createCategory');
    expect(state.data).toEqual({});
  });

  // ua: 3. Передавання даних модальному вікну
  it('3. Повинен зберігати передані дані модального вікна', () => {
    const modalData = {
      categoryId: 'category-123',
      categoryName: 'Development',
    };

    useModal.getState().onOpen('editCategory', modalData);

    const state = useModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('editCategory');
    expect(state.data).toEqual(modalData);
  });

  // ua: 4. Відкриття без передавання даних
  it('4. Повинен відкривати модальне вікно без додаткових даних', () => {
    useModal.getState().onOpen('createDocument');

    const state = useModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('createDocument');
    expect(state.data).toEqual({});
  });

  // ua: 5. Заміна поточного модального вікна іншим
  it('5. Повинен замінювати тип і дані при відкритті іншого модального вікна', () => {
    useModal.getState().onOpen('editCategory', {
      categoryId: 'category-123',
      categoryName: 'Old category',
    });

    useModal.getState().onOpen('deleteDocument', {
      documentId: 'document-456',
      documentTitle: 'Document to delete',
    });

    const state = useModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('deleteDocument');
    expect(state.data).toEqual({
      documentId: 'document-456',
      documentTitle: 'Document to delete',
    });
    expect(state.data.categoryId).toBeUndefined();
  });

  // ua: 6. Закриття модального вікна
  it('6. Повинен закривати відкрите модальне вікно', () => {
    useModal.getState().onOpen('createCategory');

    useModal.getState().onClose();

    const state = useModal.getState();

    expect(state.isOpen).toBe(false);
    expect(state.type).toBeNull();
  });

  // ua: 7. Очищення даних після закриття
  it('7. Повинен очищувати дані після закриття модального вікна', () => {
    useModal.getState().onOpen('editDocument' as ModalType, {
      documentId: 'document-123',
      documentTitle: 'Test document',
    });

    useModal.getState().onClose();

    expect(useModal.getState().data).toEqual({});
  });

  // ua: 8. Повторне відкриття після закриття
  it('8. Повинен дозволяти повторно відкривати модальне вікно після закриття', () => {
    useModal.getState().onOpen('createCategory');
    useModal.getState().onClose();

    useModal.getState().onOpen('createDocument', {
      documentId: 'document-456',
    });

    const state = useModal.getState();

    expect(state.isOpen).toBe(true);
    expect(state.type).toBe('createDocument');
    expect(state.data).toEqual({
      documentId: 'document-456',
    });
  });

  // ua: 9. Передавання callback підтвердження
  it('9. Повинен зберігати та дозволяти викликати onConfirm', () => {
    const onConfirm = vi.fn();

    useModal.getState().onOpen('confirmDeleteTask', {
      confirmTitle: 'Delete task',
      confirmDescription: 'Are you sure?',
      onConfirm,
    });

    const state = useModal.getState();

    expect(state.data.onConfirm).toBe(onConfirm);

    state.data.onConfirm?.();

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // ua: 10. Передавання callback вибору ревізії
  it('10. Повинен зберігати та дозволяти викликати onSelectRevision', () => {
    const onSelectRevision = vi.fn();

    const revision = {
      id: 'revision-123',
      content: 'Previous document content',
    } as DocumentRevision;

    useModal.getState().onOpen('revisionHistory', {
      documentId: 'document-123',
      currentContent: 'Current document content',
      onSelectRevision,
    });

    const state = useModal.getState();

    expect(state.data.onSelectRevision).toBe(onSelectRevision);

    state.data.onSelectRevision?.(revision);

    expect(onSelectRevision).toHaveBeenCalledTimes(1);
    expect(onSelectRevision).toHaveBeenCalledWith(revision);
  });
});
