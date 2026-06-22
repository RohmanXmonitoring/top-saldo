import { z } from 'zod';

export const emailSchema = z
  .string()
  .email('Email tidak valid')
  .min(1, 'Email harus diisi');

export const passwordSchema = z
  .string()
  .min(6, 'Password minimal 6 karakter');

export const nameSchema = z
  .string()
  .min(2, 'Nama minimal 2 karakter')
  .max(50, 'Nama maksimal 50 karakter');

export const phoneSchema = z
  .string()
  .regex(/^[0-9]{10,15}$/, 'Nomor telepon tidak valid')
  .optional();

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  nama: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

export const topUpSchema = z.object({
  nominal: z.number()
    .min(10000, 'Minimal top up Rp 10.000')
    .max(10000000, 'Maksimal top up Rp 10.000.000'),
  paymentMethod: z.literal('DANA'),
});

export const profileSchema = z.object({
  nama: nameSchema,
  phone: phoneSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});
