// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  experimental: {
    serverActions: {
      // Ubah dari boolean ke object
      allowedOrigins: ['localhost:3000', 'top-saldo.vercel.app'],
    },
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  output: 'standalone',
};

module.exports = nextConfig;
