import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const { email, password, nama, role = 'user' } = await request.json();

    if (!email || !password || !nama) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      );
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nama,
    });

    await auth.setCustomUserClaims(userRecord.uid, { role });

    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      nama,
      email,
      role,
      emailVerified: false,
      createdAt: new Date().toISOString(),
      saldo: 0,
      status: 'active',
    });

    return NextResponse.json({
      success: true,
      message: 'Registrasi berhasil',
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        nama,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registrasi gagal' },
      { status: 500 }
    );
  }
}
