import { create } from 'zustand';
import { Transaction } from '@/types/transaction.types';

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  currentTransaction: Transaction | null;
  setTransactions: (transactions: Transaction[]) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setCurrentTransaction: (transaction: Transaction | null) => void;
  clearTransactions: () => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  transactions: [],
  loading: false,
  currentTransaction: null,
  setTransactions: (transactions) => set({ transactions }),
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions],
  })),
  updateTransaction: (id, data) => set((state) => ({
    transactions: state.transactions.map((t) =>
      t.id === id ? { ...t, ...data } : t
    ),
  })),
  removeTransaction: (id) => set((state) => ({
    transactions: state.transactions.filter((t) => t.id !== id),
  })),
  setCurrentTransaction: (transaction) => set({ currentTransaction: transaction }),
  clearTransactions: () => set({ transactions: [], currentTransaction: null }),
}));
