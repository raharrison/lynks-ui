import {create} from 'zustand';
import type {User} from '@/types';

interface AuthState {
  user: User | null;
  checked: boolean;       // whether initial check has been performed
  loading: boolean;
  setUser: (user: User | null) => void;
  setChecked: (checked: boolean) => void;
  setLoading: (loading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  checked: false,
  loading: true,
  setUser: (user) => set({ user }),
  setChecked: (checked) => set({ checked }),
  setLoading: (loading) => set({ loading }),
  clear: () => set({ user: null, checked: true, loading: false }),
}));
