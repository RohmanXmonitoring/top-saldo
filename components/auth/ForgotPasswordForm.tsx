'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { AuthService } from '@/services/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    try {
      await AuthService.resetPassword(data.email);
      setEmailSent(true);
      toast.success('Email reset password telah dikirim');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Gagal mengirim email reset password');
    } finally {
      setLoading(false);
    }
  };
  
  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="text-6xl">📧</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Cek Email Anda
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Kami telah mengirimkan link reset password ke email Anda.
          Silakan cek inbox atau folder spam.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setEmailSent(false);
            if (onSuccess) onSuccess();
          }}
        >
          Kembali ke Login
        </Button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
      </p>
      
      <Input
        {...register('email')}
        label="Email"
        type="email"
        placeholder="masukkan@email.com"
        error={errors.email?.message}
        required
      />
      
      <Button type="submit" loading={loading} fullWidth>
        Kirim Link Reset
      </Button>
    </form>
  );
        }
