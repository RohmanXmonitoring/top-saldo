'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FaHome, 
  FaWallet, 
  FaHistory, 
  FaUser, 
  FaSignOutAlt,
  FaCog,
  FaUsers,
  FaShoppingCart,
  FaChartBar
} from 'react-icons/fa';
import { useAuthStore } from '@/store/authStore';
import { User } from '@/types/user.types';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
  user: User | null;
}

export default function Sidebar({ isOpen, onClose, pathname, user }: SidebarProps) {
  const { logout } = useAuthStore();
  const router = useRouter();

  const isAdmin = user?.role === 'admin';

  const userMenuItems = [
    { icon: FaHome, label: 'Dashboard', href: '/dashboard' },
    { icon: FaWallet, label: 'Top Up', href: '/topup' },
    { icon: FaHistory, label: 'Riwayat', href: '/transactions' },
    { icon: FaUser, label: 'Profil', href: '/profile' },
  ];

  const adminMenuItems = [
    { icon: FaChartBar, label: 'Dashboard Admin', href: '/admin/dashboard' },
    { icon: FaUsers, label: 'Kelola User', href: '/admin/users' },
    { icon: FaShoppingCart, label: 'Kelola Transaksi', href: '/admin/transactions' },
    { icon: FaCog, label: 'Pengaturan', href: '/admin/settings' },
  ];

  const menuItems = isAdmin ? [...userMenuItems, ...adminMenuItems] : userMenuItems;

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout berhasil');
      router.push('/login');
    } catch (error) {
      toast.error('Logout gagal');
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              Top Saldo
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAdmin ? 'Admin Panel' : 'Dashboard User'}
            </p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          onClose();
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}

              <li className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors"
                >
                  <FaSignOutAlt className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </li>
            </ul>
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {user?.nama?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.nama}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {isAdmin ? 'Administrator' : 'User'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
      }
