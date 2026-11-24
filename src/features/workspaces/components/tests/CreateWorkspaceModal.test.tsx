// ai tests - comp create workspace modal

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import { CreateWorkspaceModal } from '../CreateWorkspaceModal';

// ua: спільні моки для перевірки форми та створення воркспейсу
const mocks = vi.hoisted(() => ({
  reset: vi.fn(),
  mutate: vi.fn(),
  onSuccessCb: undefined as (() => void) | undefined,
  submitData: {
    name: 'Marketing Team',
    visibility: 'PRIVATE',
  },
  errors: {} as {
    name?: { message: string };
    visibility?: { message: string };
  },
}));

// ua: мок хука форми воркспейсу
vi.mock('../../hooks/useWorkspaceForm', () => ({
  useWorkspaceForm: () => ({
    register: (name: string) => ({
      name,
      onChange: vi.fn(),
      onBlur: vi.fn(),
      ref: vi.fn(),
    }),
    handleSubmit:
      (callback: (data: typeof mocks.submitData) => void) =>
      (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        callback(mocks.submitData);
      },
    reset: mocks.reset,
    formState: {
      errors: mocks.errors,
    },
  }),
}));

// ua: мок хука створення воркспейсу
vi.mock('../../hooks/useCreateWorkspace', () => ({
  useCreateWorkspace: (options: { onSuccessCb?: () => void }) => {
    mocks.onSuccessCb = options.onSuccessCb;

    return {
      mutate: mocks.mutate,
      isPending: false,
    };
  },
}));

// ua: мок AuthInput для ізоляції тестування модалки
vi.mock('@/components/ui/AuthInput', () => ({
  AuthInput: ({
    label,
    error,
    ...props
  }: React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  }) => (
    <div>
      <label htmlFor={props.name}>{label}</label>
      <input id={props.name} {...props} />
      {error && <p>{error}</p>}
    </div>
  ),
}));

// ua: мок AuthButton
vi.mock('@/components/ui/AuthButton', () => ({
  AuthButton: ({
    children,
    isLoading,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean;
  }) => (
    <button {...props} disabled={isLoading}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
}));

// ua: мок іконок Font Awesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: ({ icon }: { icon: { iconName: string } }) => (
    <span data-testid={`icon-${icon.iconName}`} />
  ),
}));

describe('CreateWorkspaceModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
      }),
    });

    Object.defineProperty(HTMLDialogElement.prototype, 'close', {
      configurable: true,
      value: vi.fn(function (this: HTMLDialogElement) {
        this.removeAttribute('open');
      }),
    });

    document.body.style.overflow = '';
  });

  afterEach(() => {
    cleanup();
    document.body.style.overflow = '';
    vi.restoreAllMocks();
  });

  it('1. має рендерити модальне вікно', () => {
    const { container } = render(
      <CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />,
    );

    expect(container.querySelector('dialog')).not.toBeNull();
  });

  it('2. має відображати заголовок Create Workspace', () => {
    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByText('Create Workspace')).not.toBeNull();
  });

  it('3. має відображати поле Workspace Name', () => {
    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByLabelText('Workspace Name')).not.toBeNull();
  });

  it('4. має відображати список вибору видимості воркспейсу', () => {
    const { container } = render(
      <CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />,
    );

    const select = container.querySelector('select');

    expect(select).not.toBeNull();
    expect(select?.querySelectorAll('option')).toHaveLength(2);
    expect(select?.querySelector('option[value="PRIVATE"]')).not.toBeNull();
    expect(select?.querySelector('option[value="PUBLIC"]')).not.toBeNull();
  });

  it('5. має відображати кнопку створення воркспейсу', () => {
    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByText('Create →')).not.toBeNull();
  });

  it('6. має відображати кнопку закриття модалки', () => {
    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByTestId('icon-xmark')).not.toBeNull();
  });

  it('7. має відкривати dialog, коли isOpen дорівнює true', () => {
    const { container } = render(
      <CreateWorkspaceModal isOpen onClose={vi.fn()} />,
    );

    const dialog = container.querySelector('dialog');

    expect(dialog).not.toBeNull();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });

  it('8. має блокувати прокручування сторінки при відкритті модалки', () => {
    render(<CreateWorkspaceModal isOpen onClose={vi.fn()} />);

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('9. має закривати dialog, коли isOpen дорівнює false', () => {
    const { rerender } = render(
      <CreateWorkspaceModal isOpen onClose={vi.fn()} />,
    );

    rerender(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(HTMLDialogElement.prototype.close).toHaveBeenCalled();
    expect(document.body.style.overflow).toBe('');
  });

  it('10. має викликати onClose при натисканні кнопки закриття', () => {
    const onClose = vi.fn();

    render(<CreateWorkspaceModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByTestId('icon-xmark').parentElement!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('11. має передавати дані форми до mutate при submit', () => {
    render(<CreateWorkspaceModal isOpen onClose={vi.fn()} />);

    fireEvent.submit(
      screen.getByRole('button', { name: 'Create →' }).closest('form')!,
    );

    expect(mocks.mutate).toHaveBeenCalledWith({
      name: 'Marketing Team',
      visibility: 'PRIVATE',
    });
  });

  it('12. має викликати reset та onClose після успішного створення', () => {
    const onClose = vi.fn();

    render(<CreateWorkspaceModal isOpen onClose={onClose} />);

    expect(mocks.onSuccessCb).toBeDefined();

    mocks.onSuccessCb?.();

    expect(mocks.reset).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('13. має відображати помилку валідації назви воркспейсу', () => {
    mocks.errors.name = {
      message: 'Workspace name is required',
    };

    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByText('Workspace name is required')).not.toBeNull();
  });

  it('14. має відображати помилку валідації видимості', () => {
    mocks.errors.visibility = {
      message: 'Invalid visibility',
    };

    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByText('Invalid visibility')).not.toBeNull();
  });

  it('15. має передавати PUBLIC як вибрану видимість у даних форми', () => {
    mocks.submitData = {
      name: 'Public Workspace',
      visibility: 'PUBLIC',
    };

    render(<CreateWorkspaceModal isOpen onClose={vi.fn()} />);

    fireEvent.submit(
      screen.getByRole('button', { name: 'Create →' }).closest('form')!,
    );

    expect(mocks.mutate).toHaveBeenCalledWith({
      name: 'Public Workspace',
      visibility: 'PUBLIC',
    });
  });

  it('16. має відображати іконку створення папки', () => {
    render(<CreateWorkspaceModal isOpen={false} onClose={vi.fn()} />);

    expect(screen.getByTestId('icon-folder-plus')).not.toBeNull();
  });
});
