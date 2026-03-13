import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === 'string' && msg.length > 0) return msg;
  }
  return fallback;
}
