import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('remindly_token');
    const userStr = localStorage.getItem('remindly_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isInitialized: true });
      } catch {
        localStorage.removeItem('remindly_token');
        localStorage.removeItem('remindly_user');
        set({ isInitialized: true });
      }
    } else {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('remindly_token', token);
      localStorage.setItem('remindly_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, fullName) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { email, password, fullName });
      const { user, token } = res.data.data;
      localStorage.setItem('remindly_token', token);
      localStorage.setItem('remindly_user', JSON.stringify(user));
      set({ user, token, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('remindly_token');
    localStorage.removeItem('remindly_user');
    set({ user: null, token: null });
    window.location.href = '/login';
  },
}));