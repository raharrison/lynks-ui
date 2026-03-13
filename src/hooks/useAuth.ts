import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, logout } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';
import type { AuthRequest } from '@/types';

export function useLogin() {
  const mutation = useMutation({
    mutationFn: (request: AuthRequest) => login(request),
  });

  return {
    loginAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

export function useLogout() {
  const { clear } = useAuthStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clear();
      queryClient.clear();
    },
    onError: () => {
      // Logout errors are non-critical — clear auth anyway
      clear();
    },
  });

  return { logout: mutation.mutate };
}
