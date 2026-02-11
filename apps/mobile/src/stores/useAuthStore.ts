import { create } from 'zustand';

import type { User, AuthTokens } from '@moneylife/shared-types';

export interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setAuthenticated: (user: User, tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({ user }),

  setTokens: (tokens) =>
    set({ tokens }),

  setAuthenticated: (user, tokens) =>
    set({ user, tokens, isAuthenticated: true, isLoading: false }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  logout: () =>
    set({ user: null, tokens: null, isAuthenticated: false }),
}));
