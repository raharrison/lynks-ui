import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Extend axios config with a per-request flag to suppress 401 redirect.
// This avoids the race condition of a shared module-level mutable boolean.
declare module 'axios' {
  interface AxiosRequestConfig {
    suppressRedirect?: boolean;
  }
}

const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.suppressRedirect &&
      window.location.pathname !== '/login'
    ) {
      useAuthStore.getState().clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
