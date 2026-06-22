import { db } from '@/lib/firebase/client';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  getDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { Transaction, TopUpFormData } from '@/types/transaction.types';
import axios from 'axios';

export class TransactionService {
  static async createTopUp(data: TopUpFormData & { uid: string }): Promise<Transaction> {
    try {
      const transactionId = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fee = Math.round(data.nominal * 0.02);
      const total = data.nominal + fee;

      const transaction: Omit<Transaction, 'id'> = {
        transactionId,
        uid: data.uid,
        amount: data.nominal,
        fee,
        total,
        paymentMethod: data.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'created',
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: serverTimestamp(),
      });

      // Call backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/process`,
        {
          transactionId,
          uid: data.uid,
          amount: total,
          paymentMethod: data.paymentMethod,
        }
      );

      if (response.data.success) {
        await updateDoc(doc(db, 'transactions', docRef.id), {
          merchantId: response.data.data.merchantId,
          merchantName: response.data.data.merchantName,
          transactionCode: response.data.data.transactionCode,
          expiresAt: response.data.data.expiresAt,
        });
      }

      return { ...transaction, id: docRef.id };
    } catch (error: any) {
      console.error('Create top up error:', error);
      throw new Error(error.message);
    }
  }

  static async getUserTransactions(uid: string, limitCount = 10): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        transactions.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          paidAt: data.paidAt?.toDate?.() || null,
          expiresAt: data.expiresAt?.toDate?.() || null,
        } as Transaction);
      });

      return transactions;
    } catch (error) {
      console.error('Get user transactions error:', error);
      return [];
    }
  }

  static async updateTransactionStatus(
    transactionId: string,
    status: 'success' | 'failed' | 'expired'
  ): Promise<void> {
    try {
      const q = query(
        collection(db, 'transactions'),
        where('transactionId', '==', transactionId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Transaction not found');
      }

      const docRef = querySnapshot.docs[0].ref;
      const batch = writeBatch(db);

      batch.update(docRef, {
        paymentStatus: status,
        orderStatus: status === 'success' ? 'paid' : 'cancelled',
        paidAt: status === 'success' ? serverTimestamp() : null,
      });

      if (status === 'success') {
        const transactionData = querySnapshot.docs[0].data();
        const userRef = doc(db, 'users', transactionData.uid);
        
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const currentSaldo = userDoc.data().saldo || 0;
          batch.update(userRef, {
            saldo: currentSaldo + transactionData.amount,
          });
        }
      }

      await batch.commit();
    } catch (error) {
      console.error('Update transaction status error:', error);
      throw error;
    }
  }
}
