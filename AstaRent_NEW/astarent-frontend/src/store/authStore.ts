import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/api';

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'tenant' | 'landlord') => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(email, password);
          const { user, token, refreshToken } = data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password, role) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register({ name, email, password, role });
          const { user, token, refreshToken } = data.data;
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: () => {
        authApi.logout().catch(() => {});
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (updates) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...updates } });
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data, token, isAuthenticated: true });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'astarent-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
