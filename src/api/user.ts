import client from './client';
import type {ActivityLogItem, AuthRequest, AuthResult, Page, PageRequest, User} from '@/types';

export async function login(request: AuthRequest): Promise<{ result: AuthResult }> {
  // The server returns 401 for TOTP_REQUIRED and INVALID_CREDENTIALS
  // but the response body still has the result. suppressRedirect prevents
  // the interceptor from redirecting so we can handle the body here.
  try {
    const { data } = await client.post('/login', request, { suppressRedirect: true });
    return data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status: number; data?: { result: AuthResult } } };
      if (axiosError.response?.status === 401 && axiosError.response?.data?.result) {
        return axiosError.response.data;
      }
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await client.post('/logout');
}

export async function getCurrentUser(): Promise<User> {
  const { data } = await client.get('/user');
  return data;
}

/** Check current user without triggering 401 redirect */
export async function checkCurrentUser(): Promise<User | null> {
  try {
    const { data } = await client.get('/user', { suppressRedirect: true });
    return data;
  } catch {
    return null;
  }
}

export async function updateUser(update: { username: string; email?: string; displayName?: string; digest?: boolean }): Promise<User> {
  const { data } = await client.put('/user', update);
  return data;
}

export async function changePassword(request: { username: string; oldPassword: string; newPassword: string }): Promise<void> {
  await client.post('/user/changePassword', request);
}

export async function getActivityLog(req?: PageRequest): Promise<Page<ActivityLogItem>> {
  const params: Record<string, string> = {};
  if (req?.page) params.page = String(req.page);
  if (req?.size) params.size = String(req.size);
  const { data } = await client.get('/user/activity', { params });
  return data;
}

// 2FA
export async function get2FAStatus(): Promise<{ enabled: boolean }> {
  const { data } = await client.get('/user/2fa');
  return data;
}

export async function get2FASecret(): Promise<{ secret: string }> {
  const { data } = await client.get('/user/2fa/secret');
  return data;
}

export async function validate2FACode(code: string): Promise<{ valid: boolean }> {
  const { data } = await client.post('/user/2fa/validate', { code });
  return data;
}

export async function update2FA(enabled: boolean): Promise<void> {
  await client.put('/user/2fa', { enabled });
}
