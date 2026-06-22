'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { TransactionService } from '@/services/transaction.service';
import { Transaction } from '@/types/transaction.types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Card from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await TransactionService.getUserTransactions(user.uid, 100);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      expired: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return colors[status] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      success: 'Berhasil',
      pending: 'Pending',
      failed: 'Gagal',
      expired: 'Kadaluarsa',
    };
    return labels[status] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      success: '✅',
      pending: '⏳',
      failed: '❌',
      expired: '⏰',
    };
    return icons[status] || '📝';
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    return t.paymentStatus === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Riwayat Transaksi
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        {['all', 'pending', 'success', 'failed', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {status === 'all' ? 'Semua' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      <Card>
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-20 h-8" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum Ada Transaksi
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Mulai top up saldo untuk melihat riwayat transaksi Anda
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(transaction.paymentStatus)}`}>
                      <span className="text-xl">{getStatusIcon(transaction.paymentStatus)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {transaction.transactionId}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(transaction.createdAt, 'dd MMM yyyy, HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                      {getStatusLabel(transaction.paymentStatus)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {transaction.paymentMethod}
                    </span>
                    <div className="text-right sm:ml-auto">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Rp {transaction.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Fee: Rp {transaction.fee.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
                  }
