import axios from 'axios';
import {useAuthStore} from '@/stores/authStore';
import {loginPath} from '@/utils/returnTo';
import {apiBaseUrl, isNative, sessionToken, setSessionToken} from '@/lib/server';

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
    // the app authenticates with a bearer token, and the API allows no credentials cross-origin
    withCredentials: !isNative,
});

// Per request, since the app chooses its server at runtime and can switch it
client.interceptors.request.use((config) => {
    config.baseURL = apiBaseUrl();
    const token = sessionToken();
    if (token) config.headers.set('Authorization', `Bearer ${token}`);
    return config;
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
        void setSessionToken(null);
        window.location.href = loginPath(window.location.pathname + window.location.search);
    }
    return Promise.reject(error);
  }
);

export default client;
