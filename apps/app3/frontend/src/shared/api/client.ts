import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api/app3/api/v1' : 'http://localhost:4003/api/v1');

export const AUTH_STORAGE_KEY =
  import.meta.env.VITE_AUTH_STORAGE_KEY || 'app3_auth_token';

export const USER_STORAGE_KEY =
  import.meta.env.VITE_USER_STORAGE_KEY || 'app3_auth_user';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      // Optional: dispatch custom event or allow AuthContext to handle
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  },
);

export function extractErrorMessage(err: any, fallback = 'Terjadi kesalahan sistem.'): string {
  if (!err) return fallback;
  const data = err.response?.data;
  if (typeof data === 'string' && data.trim()) return data;
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (typeof data?.error?.message === 'string' && data.error.message.trim()) return data.error.message;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  if (typeof data?.code === 'string' && data?.message) return `${data.code}: ${data.message}`;
  if (typeof err.message === 'string' && err.message.trim()) return err.message;
  return fallback;
}

export default apiClient;
