// components/providers/Providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const { initAuth } = useAuthStore();
  
  useEffect(() => {
    initAuth();
  }, [initAuth]);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </ThemeProvider>
  );
}
