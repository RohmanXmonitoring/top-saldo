'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const registerSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });
  
  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await AuthService.register(data);
      toast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        {...register('nama')}
        label="Nama Lengkap"
        placeholder="Nama Lengkap"
        error={errors.nama?.message}
        required
      />
      
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="masukkan@email.com"
        error={errors.email?.message}
        required
      />
      
      <Input
        {...register('password')}
        label="Password"
        type="password"
        placeholder="••••••••"
        error={errors.password?.message}
        required
      />
      
      <Input
        {...register('confirmPassword')}
        label="Konfirmasi Password"
        type="password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        required
      />
      
      <Button type="submit" loading={loading} fullWidth>
        Daftar
      </Button>
    </form>
  );
        }
