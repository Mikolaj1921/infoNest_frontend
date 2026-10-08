import { describe, it, expect } from 'vitest';
import { formatBytes } from './file-format';

describe('formatBytes utility', () => {
  it('має правильно форматувати 0 байтів', () => {
    expect(formatBytes(0)).toBe('0 Bytes');
  });

  it('має правильно конвертувати байти в кілобайти (KB)', () => {
    expect(formatBytes(1024)).toBe('1 KB');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });

  it('має правильно конвертувати байти в мегабайти (MB)', () => {
    expect(formatBytes(1048576)).toBe('1 MB');
    expect(formatBytes(2621440)).toBe('2.5 MB');
  });

  it('має підтримувати кастомну кількість знаків після коми', () => {
    expect(formatBytes(1536, 2)).toBe('1.5 KB');
    expect(formatBytes(1572864, 0)).toBe('2 MB');
  });
});
