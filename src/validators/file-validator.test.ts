// ai tests - file test

import { describe, it, expect } from 'vitest';
import { validateUploadedFile } from './file-validator';

describe('Utility: validateUploadedFile', () => {
  it('1. Має успішно пропустити валідний файл (до 10 MB з дозволеним розширенням)', () => {
    const validFile = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });
    // Імітуємо правильний розмір (наприклад, 5 MB)
    Object.defineProperty(validFile, 'size', { value: 5 * 1024 * 1024 });

    const result = validateUploadedFile(validFile);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('2. Має заблокувати файл, якщо його розмір перевищує ліміт 10 MB', () => {
    const largeFile = new File(['content'], 'archive.zip', {
      type: 'application/zip',
    });
    // Імітуємо великий розмір (12 MB)
    Object.defineProperty(largeFile, 'size', { value: 12 * 1024 * 1024 });

    const result = validateUploadedFile(largeFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('File size exceeds the limit of 10 MB');
  });

  it('3. Має заблокувати завантаження небезпечних виконуваних файлів (.exe, .bat)', () => {
    const bannedFile = new File(['content'], 'virus.exe', {
      type: 'application/x-msdownload',
    });
    Object.defineProperty(bannedFile, 'size', { value: 1024 }); // 1 KB

    const result = validateUploadedFile(bannedFile);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain(
      'File type .exe is blocked for security reasons.',
    );
  });

  it('4. Має ігнорувати регістр літер при перевірці розширення файлу (напр. .EXE або .Pdf)', () => {
    const upperBannedFile = new File(['content'], 'SETUP.EXE', {
      type: 'application/x-msdownload',
    });
    Object.defineProperty(upperBannedFile, 'size', { value: 1024 });

    const result = validateUploadedFile(upperBannedFile);
    expect(result.isValid).toBe(false);
  });
});
