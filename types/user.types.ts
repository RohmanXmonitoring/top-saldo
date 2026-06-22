// types/user.types.ts
export interface User {
  uid: string;
  nama: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
  saldo: number;
  status: 'active' | 'inactive' | 'banned';
  photoURL?: string | null;
  phoneNumber?: string | null;
  updatedAt?: Date | null;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  nama: string;
  email: string;
  password: string;
  confirmPassword: string;
}
