'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { auth, db, storage } from '@/lib/firebase/client';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Image from 'next/image';

const profileSchema = z.object({
  nama: z.string().min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password minimal 6 karakter'),
  newPassword: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nama: user?.nama || '',
      phone: user?.phoneNumber || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors },
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        nama: data.nama,
        phoneNumber: data.phone || null,
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: data.nama,
        });
      }

      setUser({ ...user, nama: data.nama, phoneNumber: data.phone || null });
      toast.success('Profil berhasil diperbarui');
    } catch (error: any) {
      toast.error(error.message || 'Gagal memperbarui profil');
    } finally {
      setLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!auth.currentUser || !auth.currentUser.email) return;

    setPasswordLoading(true);
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        data.currentPassword
      );
      
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, data.newPassword);
      
      toast.success('Password berhasil diubah');
      reset();
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        toast.error('Password saat ini salah');
      } else {
        toast.error(error.message || 'Gagal mengubah password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/photo`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      await updateDoc(doc(db, 'users', user.uid), {
        photoURL,
      });

      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { photoURL });
      }

      setUser({ ...user, photoURL });
      toast.success('Foto profil berhasil diupload');
    } catch (error: any) {
      toast.error(error.message || 'Gagal upload foto');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          Profil Saya
        </h1>

        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt={user.nama}
                  width={96}
                  height={96}
                  className="object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {user?.nama?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploading}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.nama}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user?.email}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              UID: {user?.uid?.substring(0, 12)}...
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Edit Profil
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-2 px-1 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Ganti Password
            </button>
          </div>
        </div>

        <div className="mt-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
              <Input
                {...register('nama')}
                label="Nama Lengkap"
                placeholder="Masukkan nama lengkap"
                error={errors.nama?.message}
                required
              />
              
              <Input
                label="Email"
                value={user?.email || ''}
                disabled
              />
              
              <Input
                {...register('phone')}
                label="Nomor Telepon"
                type="tel"
                placeholder="08123456789"
                error={errors.phone?.message}
              />
              
              <div className="flex justify-end">
                <Button type="submit" loading={loading}>
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
              <Input
                {...registerPassword('currentPassword')}
                label="Password Saat Ini"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.currentPassword?.message}
                required
              />
              
              <Input
                {...registerPassword('newPassword')}
                label="Password Baru"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.newPassword?.message}
                required
              />
              
              <Input
                {...registerPassword('confirmPassword')}
                label="Konfirmasi Password"
                type="password"
                placeholder="••••••••"
                error={passwordErrors.confirmPassword?.message}
                required
              />
              
              <div className="flex justify-end">
                <Button type="submit" loading={passwordLoading}>
                  Ganti Password
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
          Informasi Akun
        </h3>
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">UID</dt>
            <dd className="text-sm font-mono text-gray-900 dark:text-white">
              {user?.uid}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Role</dt>
            <dd className="text-sm font-medium">
              <span className={`px-2 py-1 rounded-full text-xs ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="text-sm font-medium">
              <span className={`px-2 py-1 rounded-full text-xs ${
                user?.status === 'active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {user?.status === 'active' ? 'Aktif' : 'Nonaktif'}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Saldo</dt>
            <dd className="text-sm font-bold text-green-600 dark:text-green-400">
              Rp {user?.saldo?.toLocaleString() || 0}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Email Terverifikasi</dt>
            <dd className="text-sm font-medium">
              {user?.emailVerified ? (
                <span className="text-green-600 dark:text-green-400">✓ Ya</span>
              ) : (
                <span className="text-yellow-600 dark:text-yellow-400">✗ Belum</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500 dark:text-gray-400">Bergabung Sejak</dt>
            <dd className="text-sm text-gray-900 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              }) : '-'}
            </dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}
