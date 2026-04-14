/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { User } from '../types';

const TOKEN_KEY = 'legalease_token';

type AuthResponse = { token: string; user: { id: string; name: string; email: string; role: 'user' | 'admin' } };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const toUser = (user: AuthResponse['user']): User => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get<User>('/auth/me');
        if (!cancelled) setUser(data);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        if (!cancelled) setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void boot();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(toUser(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<AuthResponse>('/auth/register', { name, email, password });
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(toUser(data.user));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
