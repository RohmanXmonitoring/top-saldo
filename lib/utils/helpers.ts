import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `TRX-${timestamp}-${random}`.toUpperCase();
}

export function calculateFee(amount: number, feePercentage: number = 2): number {
  return Math.round((amount * feePercentage) / 100);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    success: 'green',
    pending: 'yellow',
    failed: 'red',
    expired: 'gray',
    active: 'green',
    inactive: 'gray',
    banned: 'red',
  };
  return colors[status] || 'gray';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    success: 'Berhasil',
    pending: 'Pending',
    failed: 'Gagal',
    expired: 'Kadaluarsa',
    active: 'Aktif',
    inactive: 'Nonaktif',
    banned: 'Diblokir',
  };
  return labels[status] || status;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.toString) return error.toString();
  return 'Terjadi kesalahan yang tidak diketahui';
}

export const isBrowser = typeof window !== 'undefined';

export const storage = {
  get: (key: string) => {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove: (key: string) => {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
