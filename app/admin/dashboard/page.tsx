'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase/client';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { FaUsers, FaMoneyBill, FaShoppingCart, FaClock } from 'react-icons/fa';
import Card from '@/components/ui/Card';
import StatsCard from '@/components/dashboard/StatsCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;

      const transactionsSnapshot = await getDocs(collection(db, 'transactions'));
      const transactions = transactionsSnapshot.docs.map(doc => doc.data());

      const totalTransactions = transactions.length;
      const totalRevenue = transactions
        .filter(t => t.paymentStatus === 'success')
        .reduce((sum, t) => sum + (t.total || 0), 0);
      const pendingPayments = transactions
        .filter(t => t.paymentStatus === 'pending').length;

      setStats({
        totalUsers,
        totalTransactions,
        totalRevenue,
        pendingPayments,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: 'Total User',
      value: stats.totalUsers,
      icon: FaUsers,
      color: 'blue' as const,
    },
    {
      title: 'Total Transaksi',
      value: stats.totalTransactions,
      icon: FaShoppingCart,
      color: 'green' as const,
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString()}`,
      icon: FaMoneyBill,
      color: 'purple' as const,
    },
    {
      title: 'Pending Payment',
      value: stats.pendingPayments,
      icon: FaClock,
      color: 'yellow' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Admin
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Aktivitas Terbaru
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Data aktivitas akan ditampilkan di sini
          </p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Statistik Harian
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Grafik statistik akan ditampilkan di sini
          </p>
        </Card>
      </div>
    </div>
  );
}
