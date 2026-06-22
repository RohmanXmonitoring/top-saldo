'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { TransactionService } from '@/services/transaction.service';
import { Transaction } from '@/types/transaction.types';
import { FaWallet, FaHistory, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/dashboard/StatsCard';
import WelcomeBanner from '@/components/dashboard/WelcomeBanner';
import TransactionList from '@/components/dashboard/TransactionList';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    pending: 0,
  });
  
  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);
  
  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await TransactionService.getUserTransactions(user.uid, 10);
      setTransactions(data);
      
      const total = data.length;
      const success = data.filter(t => t.paymentStatus === 'success').length;
      const failed = data.filter(t => t.paymentStatus === 'failed').length;
      const pending = data.filter(t => t.paymentStatus === 'pending').length;
      
      setStats({ total, success, failed, pending });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const statsData = [
    {
      title: 'Total Transaksi',
      value: stats.total,
      icon: FaHistory,
      color: 'blue' as const,
    },
    {
      title: 'Berhasil',
      value: stats.success,
      icon: FaCheckCircle,
      color: 'green' as const,
    },
    {
      title: 'Gagal',
      value: stats.failed,
      icon: FaTimesCircle,
      color: 'red' as const,
    },
    {
      title: 'Saldo',
      value: `Rp ${user?.saldo?.toLocaleString() || 0}`,
      icon: FaWallet,
      color: 'purple' as const,
    },
  ];
  
  return (
    <div className="space-y-6">
      <WelcomeBanner user={user} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Riwayat Transaksi Terakhir
        </h2>
        <TransactionList transactions={transactions} loading={loading} />
      </Card>
    </div>
  );
}
