import axios from 'axios';

const env =
  typeof import.meta !== 'undefined' && (import.meta as any).env
    ? (import.meta as any).env
    : (typeof process !== 'undefined' ? process.env : {}) || {};

const rawApiUrl = env.VITE_API_BASE_URL;
export const API_BASE_URL = env.PROD
  ? rawApiUrl && !rawApiUrl.includes('localhost') && !rawApiUrl.includes('127.0.0.1')
    ? rawApiUrl
    : '/app2/api/v1'
  : rawApiUrl || 'http://localhost:4002/api/v1';

export const AUTH_STORAGE_KEY = env.VITE_AUTH_STORAGE_KEY || 'app2_auth_token';

export const USER_STORAGE_KEY = env.VITE_USER_STORAGE_KEY || 'app2_auth_user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 & 403
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      // Optional: dispatch custom event or allow AuthContext to handle
      window.dispatchEvent(new Event('auth:unauthorized'));
    } else if (error.response?.status === 403) {
      const data = error.response?.data;
      if (
        data?.code === 'ACCOUNT_PENDING_VERIFICATION' ||
        data?.code === 'ACCOUNT_REJECTED' ||
        data?.verificationStatus === 'Pending' ||
        data?.verificationStatus === 'Rejected'
      ) {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          try {
            const user = JSON.parse(storedUser);
            user.verificationStatus =
              data.verificationStatus || (data.code === 'ACCOUNT_REJECTED' ? 'Rejected' : 'Pending');
            if (data.rejectionReason) user.rejectionReason = data.rejectionReason;
            user.isProfileComplete = true;
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
          } catch {}
        }
        window.dispatchEvent(new CustomEvent('auth:verification-forbidden', { detail: data }));
      }
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: any, fallback = 'Terjadi kesalahan sistem.'): string {
  if (!err) return fallback;
  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) {
    if (data.toLowerCase().startsWith('<!doctype') || data.toLowerCase().startsWith('<html')) {
      return 'Koneksi ke server API belum terhubung. Pastikan backend sudah aktif dan VITE_API_BASE_URL sudah disetel.';
    }
    return data;
  }
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (typeof data?.error?.message === 'string' && data.error.message.trim())
    return data.error.message;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data?.code === 'string' && data?.message) return `${data.code}: ${data.message}`;
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  return fallback;
}

export default apiClient;
