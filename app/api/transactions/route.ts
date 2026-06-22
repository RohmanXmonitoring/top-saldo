import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const uid = searchParams.get('uid');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = db.collection('transactions');
    
    if (uid) {
      query = query.where('uid', '==', uid);
    }
    
    const snapshot = await query
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengambil transaksi' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const docRef = await db.collection('transactions').add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    const doc = await docRef.get();

    return NextResponse.json({
      success: true,
      data: {
        id: docRef.id,
        ...doc.data(),
      },
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal membuat transaksi' },
      { status: 500 }
    );
  }
}
