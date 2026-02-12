'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, type AuthResponse } from './api';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  register: (email: string, password: string, displayName: string) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  register: async () => null,
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ml_token');
    if (token) {
      api.auth.me().then(res => {
        if (res.ok && res.data) {
          setUser(res.data);
        } else {
          localStorage.removeItem('ml_token');
          localStorage.removeItem('ml_refresh');
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleAuth = useCallback((data: AuthResponse) => {
    localStorage.setItem('ml_token', data.accessToken);
    localStorage.setItem('ml_refresh', data.refreshToken);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await api.auth.login(email, password);
    if (res.ok && res.data) {
      handleAuth(res.data);
      return null;
    }
    return res.error || 'Login failed';
  }, [handleAuth]);

  const register = useCallback(async (email: string, password: string, displayName: string): Promise<string | null> => {
    const res = await api.auth.register(email, password, displayName);
    if (res.ok && res.data) {
      handleAuth(res.data);
      return null;
    }
    return res.error || 'Registration failed';
  }, [handleAuth]);

  const logout = useCallback(() => {
    api.auth.logout();
    localStorage.removeItem('ml_token');
    localStorage.removeItem('ml_refresh');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
