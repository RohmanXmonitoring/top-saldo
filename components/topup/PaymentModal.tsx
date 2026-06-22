'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PaymentResponse } from '@/types/transaction.types';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface PaymentModalProps {
  paymentData: PaymentResponse['data'];
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ paymentData, onClose, onSuccess }: PaymentModalProps) {
  const [countdown, setCountdown] = useState(300);
  const [checking, setChecking] = useState(false);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.error('Waktu pembayaran habis');
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onClose]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleCheckPayment = async () => {
    setChecking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const isSuccess = Math.random() > 0.3;
      
      if (isSuccess) {
        toast.success('Pembayaran berhasil!');
        onSuccess();
        onClose();
      } else {
        toast.info('Pembayaran masih pending, silakan coba lagi');
      }
    } catch (error) {
      toast.error('Gagal memeriksa status');
    } finally {
      setChecking(false);
    }
  };
  
  return (
    <Modal isOpen onClose={onClose} title="Detail Pembayaran">
      <div className="space-y-6">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pembayaran</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              Rp {paymentData.nominal.toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Kode Transaksi</p>
            <p className="font-mono text-sm font-medium">{paymentData.transactionCode}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="text-sm font-medium text-yellow-600">Pending</p>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Pembayaran ke</p>
          <p className="font-medium">{paymentData.merchantName}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {paymentData.merchantId}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Sisa Waktu Pembayaran</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatTime(countdown)}
          </p>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={handleCheckPayment}
            loading={checking}
            disabled={checking || countdown === 0}
            fullWidth
          >
            Periksa Status Pembayaran
          </Button>
          
          <Button
            variant="outline"
            onClick={onClose}
            fullWidth
          >
            Tutup
          </Button>
        </div>
        
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
          Transfer sesuai nominal di atas. Pembayaran akan otomatis terverifikasi.
        </p>
      </div>
    </Modal>
  );
}
