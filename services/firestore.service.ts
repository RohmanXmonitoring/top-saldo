import { db } from '@/lib/firebase/client';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
} from 'firebase/firestore';

export class FirestoreService {
  static async getCollection<T>(
    collectionName: string,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> {
    try {
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error('Error getting collection:', error);
      throw error;
    }
  }

  static async getDocument<T>(collectionName: string, id: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as T;
      }
      return null;
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  }

  static async addDocument<T>(
    collectionName: string,
    data: DocumentData
  ): Promise<T> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
      });
      const snapshot = await getDoc(docRef);
      return { id: docRef.id, ...snapshot.data() } as T;
    } catch (error) {
      console.error('Error adding document:', error);
      throw error;
    }
  }

  static async updateDocument(
    collectionName: string,
    id: string,
    data: DocumentData
  ): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }

  static async deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  static async queryCollection<T>(
    collectionName: string,
    field: string,
    operator: any,
    value: any,
    orderByField?: string,
    orderDirection?: 'asc' | 'desc',
    limitCount?: number
  ): Promise<T[]> {
    try {
      let q = query(
        collection(db, collectionName),
        where(field, operator, value)
      );
      
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection || 'asc'));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
    } catch (error) {
      console.error('Error querying collection:', error);
      throw error;
    }
  }
    }
