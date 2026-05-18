// ua: validator для форм авторизації та реєстрації

import { z } from 'zod';

// ua: схема для входу (Login)
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

// ua: схема для реєстрації (Register)
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Invalid email address format'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'], // ua: error запишеться в поле confirmPassword
  });

// ua: екстракт типів для використання в компонентах
// (типи для даних, які будуть передаватись в форми)
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
