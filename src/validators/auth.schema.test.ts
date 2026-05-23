// ai tests для src/validators/auth.schema.ts

import { describe, test, expect } from 'vitest';
import { loginSchema, registerSchema } from './auth.schema';

describe('Validators: Auth Zod Schemas', () => {
  describe('1. loginSchema', () => {
    test('Має успішно валідувати правильні дані користувача', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    test('Має повертати помилку, якщо email порожній або має невірний формат', () => {
      const invalidData = { email: 'invalid-email', password: 'password123' };
      const emptyData = { email: '', password: 'password123' };

      const resultInvalid = loginSchema.safeParse(invalidData);
      const resultEmpty = loginSchema.safeParse(emptyData);

      expect(resultInvalid.success).toBe(false);
      expect(resultEmpty.success).toBe(false);

      if (!resultInvalid.success) {
        expect(resultInvalid.error.issues[0].message).toBe(
          'Invalid email address format',
        );
      }
      if (!resultEmpty.success) {
        expect(resultEmpty.error.issues[0].message).toBe('Email is required');
      }
    });

    test('Має повертати помилку, якщо пароль порожній', () => {
      const invalidData = { email: 'user@example.com', password: '' };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Password is required');
      }
    });
  });

  describe('2. registerSchema', () => {
    const validRegisterData = {
      name: 'Mikołaj',
      email: 'mikolaj@nest.pl',
      password: 'SecurePassword1', // ua: має велику літеру та цифру
      confirmPassword: 'SecurePassword1',
    };

    test('Має успішно валідувати правильні дані для реєстрації', () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
    });

    test("Має блокувати реєстрацію, якщо ім'я коротше ніж 2 символи", () => {
      const invalidData = { ...validRegisterData, name: 'M' };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);

      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'Name must be at least 2 characters',
        );
      }
    });

    test('Має суворо вимагати складний пароль (мінімум 8 знаків, велика літера, цифра)', () => {
      const shortPassword = {
        ...validRegisterData,
        password: 'Pass1',
        confirmPassword: 'Pass1',
      };
      const noUppercase = {
        ...validRegisterData,
        password: 'password123',
        confirmPassword: 'password123',
      };
      const noNumber = {
        ...validRegisterData,
        password: 'Password',
        confirmPassword: 'Password',
      };

      expect(registerSchema.safeParse(shortPassword).success).toBe(false);
      expect(registerSchema.safeParse(noUppercase).success).toBe(false);
      expect(registerSchema.safeParse(noNumber).success).toBe(false);
    });

    test('Має повертати чітку помилку незбігу, якщо паролі відрізняються (Refine logic)', () => {
      const mismatchData = {
        ...validRegisterData,
        password: 'SecurePassword1',
        confirmPassword: 'DifferentPassword2',
      };

      const result = registerSchema.safeParse(mismatchData);
      expect(result.success).toBe(false);

      if (!result.success) {
        // ua: перевіряємо, що помилка записалася саме на поле confirmPassword завдяки нашому path: ['confirmPassword']
        expect(result.error.issues[0].message).toBe('Passwords do not match');
        expect(result.error.issues[0].path).toEqual(['confirmPassword']);
      }
    });
  });
});
