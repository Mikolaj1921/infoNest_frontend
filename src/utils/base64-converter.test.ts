// ai tests - base64-converter tests

import { describe, it, expect } from 'vitest';
import { convertBase64ToFile } from './base64-converter';

describe('Utility: convertBase64ToFile', () => {
  it('1. Має успішно трансформувати валідний рядок base64 у об’єкт File', () => {
    // Валідний base64 рядок прозорого пікселя PNG
    const mockBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const file = convertBase64ToFile(mockBase64, 'test-screenshot.png');

    expect(file).not.toBeNull();
    if (file) {
      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe('test-screenshot.png');
      expect(file.type).toBe('image/png');
      expect(file.size).toBeGreaterThan(0);
    }
  });

  it('2. Має повернути null, якщо рядок має невалідний формат або відсутній MIME-тип', () => {
    const invalidBase64 = 'just-some-random-text-without-mime-type';

    const file = convertBase64ToFile(invalidBase64);

    expect(file).toBeNull();
  });

  it('3. Має автоматично підставляти дефолтну назву файлу, якщо вона не передана другим аргументом', () => {
    const mockBase64 =
      'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const file = convertBase64ToFile(mockBase64);

    expect(file).not.toBeNull();
    if (file) {
      expect(file.name).toBe('screenshot.png');
      expect(file.type).toBe('image/jpeg');
    }
  });
});
