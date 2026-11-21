// ai tests - upload progress component

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { UploadProgress } from './UploadProgress';

describe('UploadProgress', () => {
  // 1. Перевірка базового рендерингу компонента
  it('1. Повинен коректно відображати компонент', () => {
    render(<UploadProgress fileName="document.pdf" progress={50} />);

    expect(screen.getByText('document.pdf')).toBeTruthy();
    expect(screen.getByText('Uploading...')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
  });

  // 2. Перевірка відображення назви файлу
  it('2. Повинен відображати передану назву файлу', () => {
    render(<UploadProgress fileName="presentation-final.pdf" progress={25} />);

    expect(screen.getByText('presentation-final.pdf')).toBeTruthy();
  });

  // 3. Перевірка title для довгої назви файлу
  it('3. Повинен встановлювати title з повною назвою файлу', () => {
    const fileName = 'very-long-document-name-for-upload.pdf';

    render(<UploadProgress fileName={fileName} progress={40} />);

    expect(screen.getByTitle(fileName)).toBeTruthy();
  });

  // 4. Перевірка відображення нульового прогресу
  it('4. Повинен відображати 0% на початку завантаження', () => {
    render(<UploadProgress fileName="document.pdf" progress={0} />);

    expect(screen.getByText('0%')).toBeTruthy();
  });

  // 5. Перевірка відображення проміжного прогресу
  it('5. Повинен відображати проміжне значення прогресу', () => {
    render(<UploadProgress fileName="document.pdf" progress={65} />);

    expect(screen.getByText('65%')).toBeTruthy();
  });

  // 6. Перевірка завершення завантаження
  it('6. Повинен відображати 100% після завершення завантаження', () => {
    render(<UploadProgress fileName="document.pdf" progress={100} />);

    expect(screen.getByText('100%')).toBeTruthy();
  });

  // 7. Перевірка ширини progress bar
  it('7. Повинен встановлювати ширину progress bar відповідно до прогресу', () => {
    const { container } = render(
      <UploadProgress fileName="document.pdf" progress={75} />,
    );

    const progressBar = container.querySelector(
      '.bg-primary.transition-all',
    ) as HTMLElement | null;

    expect(progressBar).not.toBeNull();
    expect(progressBar?.style.width).toBe('75%');
  });

  // 8. Перевірка ширини progress bar при нульовому прогресі
  it('8. Повинен встановлювати ширину progress bar 0%', () => {
    const { container } = render(
      <UploadProgress fileName="document.pdf" progress={0} />,
    );

    const progressBar = container.querySelector(
      '.bg-primary.transition-all',
    ) as HTMLElement | null;

    expect(progressBar?.style.width).toBe('0%');
  });

  // 9. Перевірка ширини progress bar при завершенні
  it('9. Повинен встановлювати ширину progress bar 100%', () => {
    const { container } = render(
      <UploadProgress fileName="document.pdf" progress={100} />,
    );

    const progressBar = container.querySelector(
      '.bg-primary.transition-all',
    ) as HTMLElement | null;

    expect(progressBar?.style.width).toBe('100%');
  });

  // 10. Перевірка оновлення прогресу
  it('10. Повинен оновлювати значення progress bar після зміни прогресу', () => {
    const { container, rerender } = render(
      <UploadProgress fileName="document.pdf" progress={20} />,
    );

    const progressBar = container.querySelector(
      '.bg-primary.transition-all',
    ) as HTMLElement | null;

    expect(progressBar?.style.width).toBe('20%');

    rerender(<UploadProgress fileName="document.pdf" progress={80} />);

    expect(progressBar?.style.width).toBe('80%');
    expect(screen.getByText('80%')).toBeTruthy();
  });

  // 11. Перевірка оновлення назви файлу
  it('11. Повинен оновлювати назву файлу після зміни props', () => {
    const { rerender } = render(
      <UploadProgress fileName="old-file.pdf" progress={30} />,
    );

    expect(screen.getByText('old-file.pdf')).toBeTruthy();

    rerender(<UploadProgress fileName="new-file.pdf" progress={60} />);

    expect(screen.getByText('new-file.pdf')).toBeTruthy();
    expect(screen.queryByText('old-file.pdf')).toBeNull();
    expect(screen.getByText('60%')).toBeTruthy();
  });
});
