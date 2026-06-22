// components/topup/TopUpForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { TopUpFormData } from '@/types/transaction.types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const topUpSchema = z.object({
  nominal: z.number()
    .min(10000, 'Minimal top up Rp 10.000')
    .max(10000000, 'Maksimal top up Rp 10.000.000'),
  paymentMethod: z.literal('DANA'),
});

interface TopUpFormProps {
  onSubmit: (data: TopUpFormData) => void;
  loading?: boolean;
}

export default function TopUpForm({ onSubmit, loading = false }: TopUpFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TopUpFormData>({
    resolver: zodResolver(topUpSchema),
    defaultValues: {
      nominal: 10000,
      paymentMethod: 'DANA',
    },
  });
  
  const nominal = watch('nominal');
  const paymentMethod = watch('paymentMethod');
  
  const quickAmounts = [10000, 20000, 50000, 100000, 200000, 500000];
  
  const handleFormSubmit = (data: TopUpFormData) => {
    if (!data.nominal || data.nominal < 10000) {
      toast.error('Nominal minimal Rp 10.000');
      return;
    }
    onSubmit(data);
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nominal Top Up
        </label>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setValue('nominal', amount)}
              className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                nominal === amount
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Rp {amount.toLocaleString()}
            </button>
          ))}
        </div>
        
        <Input
          {...register('nominal', { valueAsNumber: true })}
          type="number"
          label="Atau masukkan nominal"
          placeholder="10000"
          error={errors.nominal?.message}
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Metode Pembayaran
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              {...register('paymentMethod')}
              type="radio"
              value="DANA"
              checked={paymentMethod === 'DANA'}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label className="ml-2 text-sm text-gray-900 dark:text-white">
              DANA Merchant
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 Pembayaran akan diproses melalui DANA Merchant. 
          Pastikan Anda memiliki aplikasi DANA yang terinstall.
        </p>
      </div>
      
      <Button
        type="submit"
        loading={loading}
        disabled={loading || !nominal}
        fullWidth
        size="lg"
      >
        {nominal ? `Bayar Rp ${nominal.toLocaleString()}` : 'Pilih Nominal'}
      </Button>
    </form>
  );
              }
