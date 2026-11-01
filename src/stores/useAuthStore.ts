import { create } from 'zustand';
import { UserProfile } from '@/types';
import { authService } from '@/services/firebase/authService';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initAuth: () => () => void;
  login: (email: string, pass: string) => Promise<UserProfile>;
  signup: (email: string, pass: string, name: string) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  initAuth: () => {
    set({ isLoading: true });
    const unsubscribe = authService.onAuthStateChanged((user) => {
      set({ user, isLoading: false });
    });
    return unsubscribe;
  },

  login: async (email, pass) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(email, pass);
      set({ user, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.message || 'Failed to sign in. Please verify your email and password.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  signup: async (email, pass, name) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.signup(email, pass, name);
      set({ user, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.message || 'Failed to create account. Please try again.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.loginWithGoogle();
      set({ user, isLoading: false });
      return user;
    } catch (err: any) {
      const msg = err.message || 'Google sign-in was interrupted.';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await authService.logout();
    set({ user: null, isLoading: false });
  },

  updateProfile: async (updates) => {
    const current = get().user;
    if (!current) return;
    await authService.updateProfile(current.id, updates);
    set({ user: { ...current, ...updates } });
  },

  clearError: () => set({ error: null }),
}));

