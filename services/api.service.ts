import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/store/authStore';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      async (config) => {
        const { user } = useAuthStore.getState();
        if (user) {
          const token = await this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const { logout } = useAuthStore.getState();
          await logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private async getToken(): Promise<string | null> {
    try {
      const { auth } = await import('@/lib/firebase/client');
      const user = auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.get(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.post(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.put(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.patch(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.api.delete(url, config);
    return response.data;
  }

  // Specific API calls
  async topUp(data: { uid: string; amount: number; paymentMethod: string }) {
    return this.post('/transactions/topup', data);
  }

  async getTransactions(uid: string, limit = 10) {
    return this.get(`/transactions?uid=${uid}&limit=${limit}`);
  }

  async getUsers() {
    return this.get('/admin/users');
  }

  async updateUser(uid: string, data: any) {
    return this.put(`/admin/users/${uid}`, data);
  }

  async deleteUser(uid: string) {
    return this.delete(`/admin/users/${uid}`);
  }

  async getDashboardStats() {
    return this.get('/admin/stats');
  }
}

export const apiService = new ApiService();
export default apiService;
