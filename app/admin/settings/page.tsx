'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    merchantName: '',
    merchantId: '',
    feePercentage: 2,
    minTopUp: 10000,
    maxTopUp: 10000000,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'settings', 'general');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Gagal memuat pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const docRef = doc(db, 'settings', 'general');
      await updateDoc(docRef, {
        ...settings,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <Card>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Pengaturan
      </h1>

      <Card>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nama Merchant"
              value={settings.merchantName}
              onChange={(e) => setSettings({ ...settings, merchantName: e.target.value })}
              placeholder="Nama Merchant"
              required
            />
            
            <Input
              label="ID Merchant"
              value={settings.merchantId}
              onChange={(e) => setSettings({ ...settings, merchantId: e.target.value })}
              placeholder="ID Merchant"
              required
            />
            
            <Input
              label="Fee Percentage (%)"
              type="number"
              value={settings.feePercentage}
              onChange={(e) => setSettings({ ...settings, feePercentage: Number(e.target.value) })}
              placeholder="2"
              min={0}
              max={100}
              required
            />
            
            <Input
              label="Minimal Top Up"
              type="number"
              value={settings.minTopUp}
              onChange={(e) => setSettings({ ...settings, minTopUp: Number(e.target.value) })}
              placeholder="10000"
              required
            />
            
            <Input
              label="Maksimal Top Up"
              type="number"
              value={settings.maxTopUp}
              onChange={(e) => setSettings({ ...settings, maxTopUp: Number(e.target.value) })}
              placeholder="10000000"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={saving}>
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
