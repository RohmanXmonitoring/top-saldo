'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

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

export default function RegisterPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Daftar Akun
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Buat akun Top Saldo baru
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
          </div>
          
          <Button type="submit" loading={loading} fullWidth>
            Daftar
          </Button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Masuk
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
    }
