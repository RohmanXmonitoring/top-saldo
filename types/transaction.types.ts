export interface Transaction {
  id?: string;
  transactionId: string;
  uid: string;
  amount: number;
  fee: number;
  total: number;
  paymentMethod: 'DANA' | 'OVO' | 'GOPAY';
  paymentStatus: 'pending' | 'success' | 'failed' | 'expired';
  orderStatus: 'created' | 'paid' | 'cancelled' | 'refunded';
  createdAt: Date;
  paidAt?: Date | null;
  expiresAt?: Date | null;
  merchantId?: string | null;
  merchantName?: string | null;
  transactionCode?: string | null;
}

export interface TopUpFormData {
  nominal: number;
  paymentMethod: 'DANA';
}

export interface PaymentResponse {
  success: boolean;
  data: {
    transactionId: string;
    merchantId: string;
    merchantName: string;
    nominal: number;
    transactionCode: string;
    paymentStatus: string;
    expiresAt: string;
    qrCode?: string;
  };
  message?: string;
}
