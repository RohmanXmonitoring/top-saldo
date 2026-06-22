// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const user = await AuthService.login(data);
      setUser(user);
      toast.success('Login berhasil!');
      router.push(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md p-6 md:p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Top Saldo
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Masuk ke akun Anda
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
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
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('rememberMe')}
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Ingat saya
              </label>
            </div>
            
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Lupa password?
            </Link>
          </div>
          
          <Button type="submit" loading={loading} fullWidth>
            Masuk
          </Button>
          
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Daftar
            </Link>
          </p>
        </form>
      </Card>
    </div>
  );
}
