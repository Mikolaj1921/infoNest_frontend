// ai tests - модалка створення задачі Kanban

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { CreateTaskModal } from '../CreateTaskModal';
import { useModal } from '@/hooks/use-modal-store';
import { useCreateTask } from '@/hooks/useKanbanData';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const mocks = vi.hoisted(() => ({
  isOpen: true,
  type: 'createBoardTask' as string | null,
  columnId: 'col-1' as string | undefined,
  isPending: false,
  onClose: vi.fn(),
  mutate: vi.fn(),
}));

vi.mock('@/hooks/use-modal-store', () => ({
  useModal: vi.fn(),
}));

vi.mock('@/hooks/useKanbanData', () => ({
  useCreateTask: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'ws-123' }),
}));

vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="font-awesome-icon" />,
}));

describe('Modal Component: CreateTaskModal', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();

    mocks.isOpen = true;
    mocks.type = 'createBoardTask';
    mocks.columnId = 'col-1';
    mocks.isPending = false;

    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    vi.mocked(useModal).mockReturnValue({
      isOpen: mocks.isOpen,
      type: mocks.type,
      data: { columnId: mocks.columnId },
      onOpen: vi.fn(),
      onClose: mocks.onClose,
    });

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: mocks.isPending,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const renderModal = () => render(<CreateTaskModal />, { wrapper });

  const fillTitle = (value: string) => {
    fireEvent.change(
      screen.getByPlaceholderText('E.g., Implement role middleware...'),
      {
        target: { value },
      },
    );
  };

  const fillDescription = (value: string) => {
    fireEvent.change(screen.getByPlaceholderText('Add task details here...'), {
      target: { value },
    });
  };

  const submitForm = () => {
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
  };

  // 1. Rendering

  it('1.1. Повинен відображати модалку, коли вона відкрита', () => {
    renderModal();

    expect(screen.getByText('Create New Task')).toBeTruthy();
  });

  it('1.2. Повинен відображати поле назви задачі', () => {
    renderModal();

    expect(screen.getByText('Task Name')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('E.g., Implement role middleware...'),
    ).toBeTruthy();
  });

  it('1.3. Повинен відображати поле опису', () => {
    renderModal();

    expect(screen.getByText('Description (optional)')).toBeTruthy();
    expect(
      screen.getByPlaceholderText('Add task details here...'),
    ).toBeTruthy();
  });

  it('1.4. Повинен відображати поле пріоритету з усіма варіантами', () => {
    renderModal();

    expect(screen.getByText('Priority')).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Low' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'Medium' })).toBeTruthy();
    expect(screen.getByRole('option', { name: 'High' })).toBeTruthy();
  });

  it('1.5. Повинен відображати поле вибору дати', () => {
    renderModal();

    expect(screen.getByText('Due Date')).toBeTruthy();

    const dateInput = document.querySelector(
      'input[name="dueDate"]',
    ) as HTMLInputElement;

    expect(dateInput).toBeTruthy();
    expect(dateInput.type).toBe('date');
  });

  it('1.6. Повинен відображати кнопки Cancel та Create', () => {
    renderModal();

    expect(screen.getByRole('button', { name: 'Cancel' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Create' })).toBeTruthy();
  });

  // 2. Modal visibility

  it('2.1. Повинен повертати null, якщо модалка закрита', () => {
    mocks.isOpen = false;

    vi.mocked(useModal).mockReturnValue({
      isOpen: false,
      type: 'createBoardTask',
      data: { columnId: 'col-1' },
      onOpen: vi.fn(),
      onClose: mocks.onClose,
    });

    renderModal();

    expect(screen.queryByText('Create New Task')).toBeNull();
  });

  it('2.2. Повинен повертати null для іншого типу модалки', () => {
    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'editWorkspace',
      data: { columnId: 'col-1' },
      onOpen: vi.fn(),
      onClose: mocks.onClose,
    });

    renderModal();

    expect(screen.queryByText('Create New Task')).toBeNull();
  });

  // 3. Form validation

  it('3.1. Не повинен створювати задачу з порожньою назвою', async () => {
    renderModal();

    submitForm();

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeTruthy();
    });

    expect(mocks.mutate).not.toHaveBeenCalled();
  });

  it('3.2. Не повинен створювати задачу, якщо назва перевищує 200 символів', async () => {
    renderModal();

    fillTitle('A'.repeat(201));
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).not.toHaveBeenCalled();
    });
  });

  it('3.3. Повинен приймати назву довжиною рівно 200 символів', async () => {
    renderModal();

    fillTitle('A'.repeat(200));
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalled();
    });
  });

  // 4. Task creation

  it('4.1. Повинен викликати mutate з основними даними задачі', async () => {
    renderModal();

    fillTitle('Implement authentication');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        {
          title: 'Implement authentication',
          description: '',
          priority: 'MEDIUM',
          dueDate: '',
          columnId: 'col-1',
          workspaceId: 'ws-123',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it('4.2. Повинен обрізати пробіли в назві задачі', async () => {
    renderModal();

    fillTitle('  New task  ');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New task',
        }),
        expect.any(Object),
      );
    });
  });

  it('4.3. Повинен обрізати пробіли в описі задачі', async () => {
    renderModal();

    fillTitle('New task');
    fillDescription('  Task description  ');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Task description',
        }),
        expect.any(Object),
      );
    });
  });

  it('4.4. Повинен передавати вибраний пріоритет HIGH', async () => {
    renderModal();

    fillTitle('Important task');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'HIGH' },
    });

    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'HIGH',
        }),
        expect.any(Object),
      );
    });
  });

  it('4.5. Повинен передавати вибраний пріоритет LOW', async () => {
    renderModal();

    fillTitle('Low priority task');

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'LOW' },
    });

    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'LOW',
        }),
        expect.any(Object),
      );
    });
  });

  it('4.6. Повинен перетворювати дату на ISO-формат', async () => {
    renderModal();

    fillTitle('Task with deadline');

    const dateInput = document.querySelector(
      'input[name="dueDate"]',
    ) as HTMLInputElement;

    fireEvent.change(dateInput, {
      target: { value: '2026-12-15' },
    });

    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          dueDate: new Date('2026-12-15').toISOString(),
        }),
        expect.any(Object),
      );
    });
  });

  it('4.7. Не повинен викликати mutate, якщо columnId відсутній', async () => {
    mocks.columnId = undefined;

    vi.mocked(useModal).mockReturnValue({
      isOpen: true,
      type: 'createBoardTask',
      data: {},
      onOpen: vi.fn(),
      onClose: mocks.onClose,
    });

    renderModal();

    fillTitle('Task without column');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).not.toHaveBeenCalled();
    });
  });

  // 5. Successful creation

  it('5.1. Повинен передавати onSuccess callback у mutate', async () => {
    renderModal();

    fillTitle('Successful task');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          onSuccess: expect.any(Function),
        }),
      );
    });
  });

  it('5.2. Повинен очищати форму та закривати модалку після успіху', async () => {
    renderModal();

    fillTitle('Successful task');
    submitForm();

    await waitFor(() => {
      expect(mocks.mutate).toHaveBeenCalled();
    });

    const options = mocks.mutate.mock.calls[0][1];

    act(() => {
      options.onSuccess();
    });

    expect(mocks.onClose).toHaveBeenCalled();

    expect(
      (
        screen.getByPlaceholderText(
          'E.g., Implement role middleware...',
        ) as HTMLInputElement
      ).value,
    ).toBe('');
  });

  // 6. Modal closing

  it('6.1. Повинен закривати модалку після натискання Cancel', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mocks.onClose).toHaveBeenCalled();
  });

  it('6.2. Повинен закривати модалку після натискання кнопки X', () => {
    renderModal();

    const buttons = screen.getAllByRole('button');

    fireEvent.click(buttons[0]);

    expect(mocks.onClose).toHaveBeenCalled();
  });

  // 7. Pending state

  it('7.1. Повинен блокувати поле назви під час створення задачі', () => {
    mocks.isPending = true;

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: true,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);

    renderModal();

    expect(
      (
        screen.getByPlaceholderText(
          'E.g., Implement role middleware...',
        ) as HTMLInputElement
      ).disabled,
    ).toBe(true);
  });

  it('7.2. Повинен блокувати поле опису під час створення задачі', () => {
    mocks.isPending = true;

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: true,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);

    renderModal();

    expect(
      (
        screen.getByPlaceholderText(
          'Add task details here...',
        ) as HTMLTextAreaElement
      ).disabled,
    ).toBe(true);
  });

  it('7.3. Повинен блокувати пріоритет та дату під час створення задачі', () => {
    mocks.isPending = true;

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: true,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);

    renderModal();

    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(
      true,
    );

    const dateInput = document.querySelector(
      'input[name="dueDate"]',
    ) as HTMLInputElement;

    expect(dateInput.disabled).toBe(true);
  });

  it('7.4. Повинен блокувати кнопки Cancel, Create та календаря під час створення', () => {
    mocks.isPending = true;

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: true,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);

    renderModal();

    expect(
      (screen.getByRole('button', { name: 'Cancel' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    expect(
      (screen.getByRole('button', { name: 'Create' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  });

  it('7.5. Повинен відображати індикатор завантаження під час створення', () => {
    mocks.isPending = true;

    vi.mocked(useCreateTask).mockReturnValue({
      isPending: true,
      mutate: mocks.mutate,
    } as unknown as ReturnType<typeof useCreateTask>);

    renderModal();

    const createButton = screen.getByRole('button', { name: 'Create' });

    expect(
      createButton.querySelector('[data-testid="font-awesome-icon"]'),
    ).not.toBeNull();
  });

  // 8. Calendar interaction

  it('8.1. Повинен викликати showPicker при натисканні на іконку календаря', () => {
    renderModal();

    const dateInput = document.querySelector(
      'input[name="dueDate"]',
    ) as HTMLInputElement;

    const showPickerMock = vi.fn();
    dateInput.showPicker = showPickerMock;

    const calendarButton = dateInput.parentElement?.querySelector(
      'button[type="button"]',
    ) as HTMLButtonElement;

    fireEvent.click(calendarButton);

    expect(showPickerMock).toHaveBeenCalled();
  });
});
