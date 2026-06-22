import { Transaction } from '@/types/transaction.types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import Skeleton from '@/components/ui/Skeleton';

interface TransactionListProps {
  transactions: Transaction[];
  loading: boolean;
}

export default function TransactionList({ transactions, loading }: TransactionListProps) {
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

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="w-20 h-8" />
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500 dark:text-gray-400">
        <p>Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="py-4 first:pt-0 last:pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(transaction.paymentStatus)}`}>
                <span className="text-xl">
                  {transaction.paymentStatus === 'success' ? '✅' : 
                   transaction.paymentStatus === 'failed' ? '❌' : '⏳'}
                </span>
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
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                Rp {transaction.total.toLocaleString()}
              </p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus)}`}>
                {getStatusLabel(transaction.paymentStatus)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
