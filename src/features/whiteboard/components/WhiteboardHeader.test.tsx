// ai tests - whiteboard header

import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import WhiteboardHeader from './WhiteboardHeader';

describe('WhiteboardHeader', () => {
  test('1. Відображає заголовок та опис дошки', () => {
    render(
      <WhiteboardHeader
        saveStatus="saved"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByText('Workspace Whiteboard')).toBeTruthy();
    expect(
      screen.getByText('Visualize ideas, map workflows, and collaborate.'),
    ).toBeTruthy();
  });

  test('2. Відображає статус успішного збереження', () => {
    render(
      <WhiteboardHeader
        saveStatus="saved"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByText('All changes saved')).toBeTruthy();
  });

  test('3. Відображає статус збереження під час очікування', () => {
    render(
      <WhiteboardHeader
        saveStatus="saving"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByText('Saving...')).toBeTruthy();
  });

  test('4. Відображає помилку збереження', () => {
    render(
      <WhiteboardHeader
        saveStatus="error"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByText('Save failed')).toBeTruthy();
  });

  test('5. Відображає кнопку View board у режимі редагування', () => {
    render(
      <WhiteboardHeader
        saveStatus="saved"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /View board/i })).toBeTruthy();
  });

  test('6. Відображає кнопку Edit board у режимі перегляду', () => {
    render(
      <WhiteboardHeader
        saveStatus="saved"
        isReadOnly
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Edit board/i })).toBeTruthy();
  });

  test('7. Викликає onToggleReadOnly після натискання кнопки', () => {
    const onToggleReadOnly = vi.fn();

    render(
      <WhiteboardHeader
        saveStatus="saved"
        isReadOnly={false}
        onToggleReadOnly={onToggleReadOnly}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /View board/i }));

    expect(onToggleReadOnly).toHaveBeenCalledTimes(1);
  });

  test('8. Не відображає кнопку, якщо onToggleReadOnly не передано', () => {
    render(<WhiteboardHeader saveStatus="saved" isReadOnly />);

    expect(
      screen.queryByRole('button', { name: /View board|Edit board/i }),
    ).toBeNull();
  });

  test('9. Статус збереження доступний через aria-live', () => {
    render(
      <WhiteboardHeader
        saveStatus="saving"
        isReadOnly={false}
        onToggleReadOnly={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Saving...').parentElement?.getAttribute('aria-live'),
    ).toBe('polite');
  });
});
