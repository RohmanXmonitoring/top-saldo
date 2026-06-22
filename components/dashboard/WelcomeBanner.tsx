'use client';

import { User } from '@/types/user.types';
import { formatCurrency } from '@/lib/utils/helpers';

interface WelcomeBannerProps {
  user: User | null;
}

export default function WelcomeBanner({ user }: WelcomeBannerProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Selamat Datang, {user?.nama || 'User'}! 👋
          </h1>
          <p className="text-blue-100 mt-1">
            {user?.role === 'admin' ? 'Admin Panel' : 'Kelola saldo dan transaksi Anda'}
          </p>
        </div>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3">
          <p className="text-sm text-blue-100">Saldo Anda</p>
          <p className="text-2xl font-bold">
            {formatCurrency(user?.saldo || 0)}
          </p>
        </div>
      </div>
      
      {user?.role === 'user' && (
        <div className="mt-4 flex flex-wrap gap-3">
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">UID</span>
            <p className="text-sm font-mono">{user.uid}</p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Status</span>
            <p className="text-sm font-medium">
              {user.status === 'active' ? '✅ Aktif' : '❌ Nonaktif'}
            </p>
          </div>
          <div className="bg-white/10 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-100">Role</span>
            <p className="text-sm font-medium capitalize">{user.role}</p>
          </div>
        </div>
      )}
    </div>
  );
}
