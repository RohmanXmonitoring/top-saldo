import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase/client';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { User, RegisterFormData, LoginFormData } from '@/types/user.types';

export class AuthService {
  static async register(userData: RegisterFormData): Promise<User> {
    try {
      const { email, password, nama } = userData;
      
      const userCredential: UserCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const { user } = userCredential;
      
      await updateProfile(user, { displayName: nama });
      await sendEmailVerification(user);
      
      const userDoc: User = {
        uid: user.uid,
        nama,
        email: user.email!,
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        saldo: 0,
        status: 'active',
        photoURL: null,
        phoneNumber: null,
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userDoc,
        createdAt: serverTimestamp(),
      });
      
      return userDoc;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async login(loginData: LoginFormData): Promise<User> {
    try {
      const { email, password } = loginData;
      
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      const { user } = userCredential;
      
      if (!user.emailVerified) {
        await sendEmailVerification(user);
        throw new Error('Email belum diverifikasi. Silakan cek email Anda.');
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      
      const userData = userDoc.data() as User;
      
      if (userData.status !== 'active') {
        throw new Error('Account is not active');
      }
      
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw new Error(this.getErrorMessage(error.code));
    }
  }
  
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }
  
  private static getErrorMessage(code: string): string {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'Email sudah terdaftar',
      'auth/invalid-email': 'Email tidak valid',
      'auth/user-disabled': 'Akun dinonaktifkan',
      'auth/user-not-found': 'User tidak ditemukan',
      'auth/wrong-password': 'Password salah',
      'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
    };
    return messages[code] || 'Terjadi kesalahan, silakan coba lagi';
  }
                                 }
