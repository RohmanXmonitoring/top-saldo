// lib/utils/toast.ts
import toast from 'react-hot-toast';

export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#fff',
      },
    });
  },
  
  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: '#fff',
      },
    });
  },
  
  info: (message: string) => {
    toast(message, {
      icon: 'ℹ️',
      duration: 4000,
      style: {
        background: '#3b82f6',
        color: '#fff',
      },
    });
  },
  
  warning: (message: string) => {
    toast(message, {
      icon: '⚠️',
      duration: 4000,
      style: {
        background: '#f59e0b',
        color: '#fff',
      },
    });
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  dismiss: (id: string) => {
    toast.dismiss(id);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
    });
  },
};
