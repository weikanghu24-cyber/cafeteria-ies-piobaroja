import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const isAuthRoute = originalRequest.url?.includes('/auth/');

    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      const { refreshToken, setTokens, logout } = useAuthStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
        }
        const { data } = await refreshPromise;
        refreshPromise = null;

        setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken,
        });
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  if (!error.response) return 'No hay conexión con el servidor';
  const data = error.response.data;
  if (typeof data === 'string') return data;
  if (data?.detail) return data.detail;
  if (data?.non_field_errors) return data.non_field_errors.join(', ');
  if (typeof data === 'object') {
    const firstField = Object.entries(data)[0];
    if (firstField) {
      const [field, msgs] = firstField;
      const msg = Array.isArray(msgs) ? msgs[0] : msgs;
      return field === 'detail' ? msg : `${field}: ${msg}`;
    }
  }
  return 'Ha ocurrido un error';
}
