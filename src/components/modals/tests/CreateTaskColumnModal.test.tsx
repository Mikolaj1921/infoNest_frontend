// tests for CreateTaskColumnModal
// ua: Тести модального вікна створення нової колонки Kanban

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { CreateTaskColumnModal } from '../CreateTaskColumnModal';

const mocks = vi.hoisted(() => ({
  isOpen: true,
  type: 'createTaskColumn' as string | null,
  isPending: false,
  onClose: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: () => ({
    isOpen: mocks.isOpen,
    type: mocks.type,
    data: {},
    onOpen: vi.fn(),
    onClose: mocks.onClose,
  }),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useCreateColumn: () => ({
    isPending: mocks.isPending,
    mutate: mocks.mutate,
  }),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="font-awesome-icon" />,
}));

describe('CreateTaskColumnModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.isOpen = true;
    mocks.type = 'createTaskColumn';
    mocks.isPending = false;
  });

  const renderModal = () => render(<CreateTaskColumnModal />);

  const getNameInput = () => screen.getByRole('textbox');

  const fillName = (name: string) => {
    fireEvent.change(getNameInput(), {
      target: { value: name },
    });
  };

  const submitForm = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  };

  // 1. Rendering

  describe('1. Rendering', () => {
    it('1.1. Повинен відображати модальне вікно створення колонки', () => {
      renderModal();

      expect(screen.getByText('Create New Column')).toBeTruthy();
    });

    it('1.2. Повинен відображати поле введення назви колонки', () => {
      renderModal();

      expect(getNameInput()).toBeTruthy();
      expect(
        screen.getByPlaceholderText('E.g., In Progress, Testing...'),
      ).toBeTruthy();
    });

    it('1.3. Повинен відображати кнопки Cancel та Create', () => {
      renderModal();

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
      expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
    });

    it('1.4. Повинен повертати null, якщо модальне вікно закрите', () => {
      mocks.isOpen = false;

      renderModal();

      expect(screen.queryByText('Create New Column')).toBeNull();
    });

    it('1.5. Повинен повертати null, якщо відкритий інший тип модального вікна', () => {
      mocks.type = 'editWorkspace';

      renderModal();

      expect(screen.queryByText('Create New Column')).toBeNull();
    });
  });

  // 2. Form validation

  describe('2. Form validation', () => {
    it('2.1. Повинен показувати помилку, якщо назва колонки порожня', async () => {
      renderModal();

      submitForm();

      expect(
        await screen.findByText('Name of the column is required'),
      ).toBeTruthy();

      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('2.2. Повинен відхиляти назву, яка складається лише з пробілів', async () => {
      renderModal();

      fillName('     ');
      submitForm();

      expect(
        await screen.findByText('Name of the column is required'),
      ).toBeTruthy();

      expect(mocks.mutate).not.toHaveBeenCalled();
    });

    it('2.3. Повинен відхиляти назву довшу за 100 символів', async () => {
      renderModal();

      fillName('A'.repeat(101));
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).not.toHaveBeenCalled();
      });
    });

    it('2.4. Повинен дозволяти назву довжиною рівно 100 символів', async () => {
      renderModal();

      const name = 'A'.repeat(100);

      fillName(name);
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).toHaveBeenCalledWith(name, expect.any(Object));
      });
    });
  });

  // 3. Column creation

  describe('3. Column creation', () => {
    it('3.1. Повинен викликати mutate з назвою нової колонки', async () => {
      renderModal();

      fillName('In Progress');
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).toHaveBeenCalledWith(
          'In Progress',
          expect.any(Object),
        );
      });
    });

    it('3.2. Повинен видаляти зайві пробіли на початку та в кінці назви', async () => {
      renderModal();

      fillName('  In Progress  ');
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).toHaveBeenCalledWith(
          'In Progress',
          expect.any(Object),
        );
      });
    });

    it('3.3. Повинен передавати callback onSuccess у mutate', async () => {
      renderModal();

      fillName('Testing');
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).toHaveBeenCalled();
      });

      const options = mocks.mutate.mock.calls[0][1];

      expect(options.onSuccess).toBeTypeOf('function');
    });

    it('3.4. Повинен очистити форму та закрити модалку після успішного створення', async () => {
      renderModal();

      fillName('Completed');
      submitForm();

      await waitFor(() => {
        expect(mocks.mutate).toHaveBeenCalled();
      });

      const options = mocks.mutate.mock.calls[0][1];

      options.onSuccess();

      expect((getNameInput() as HTMLInputElement).value).toBe('');
      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // 4. Closing modal

  describe('4. Closing modal', () => {
    it('4.1. Повинен закривати модалку після натискання Cancel', () => {
      renderModal();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });

    it('4.2. Повинен закривати модалку після натискання кнопки з іконкою X', () => {
      renderModal();

      const buttons = screen.getAllByRole('button');

      fireEvent.click(buttons[0]);

      expect(mocks.onClose).toHaveBeenCalledTimes(1);
    });
  });

  // 5. Pending state

  describe('5. Pending state', () => {
    it('5.1. Повинен блокувати поле введення під час створення колонки', () => {
      mocks.isPending = true;

      renderModal();

      expect(getNameInput()).toHaveProperty('disabled', true);
    });

    it('5.2. Повинен блокувати кнопки Cancel та Create під час створення', () => {
      mocks.isPending = true;

      renderModal();

      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveProperty(
        'disabled',
        true,
      );

      expect(screen.getByRole('button', { name: 'Create' })).toHaveProperty(
        'disabled',
        true,
      );
    });

    it('5.3. Повинен відображати індикатор завантаження під час створення', () => {
      mocks.isPending = true;

      renderModal();

      const createButton = screen.getByRole('button', {
        name: 'Create',
      });

      expect(
        createButton.querySelector('[data-testid="font-awesome-icon"]'),
      ).not.toBeNull();
    });
  });
});
