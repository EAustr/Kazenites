import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config';

type User = { id: number; email: string; role: string } | null;

type AuthContextType = {
  user: User;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, city?: string) => Promise<void>;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: false,
  error: null,
  login: async () => {},
  register: async () => {},
  refreshMe: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem('auth');
        if (saved) {
          const parsed = JSON.parse(saved) as { token: string; email: string; userId: number; role: string };
          setToken(parsed.token);
          setUser({ id: parsed.userId, email: parsed.email, role: parsed.role });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const persist = useCallback(async (payload: any) => {
    await AsyncStorage.setItem('auth', JSON.stringify(payload));
  }, []);

  const clear = useCallback(async () => {
    await AsyncStorage.removeItem('auth');
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Login failed with ${res.status}`);
    }
    const data = (await res.json()) as { token: string; userId: number; email: string; role: string };
    setToken(data.token);
    setUser({ id: data.userId, email: data.email, role: data.role });
    await persist(data);
  }, [persist]);

  const register = useCallback(async (email: string, password: string, name: string, city?: string) => {
    setError(null);
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name, city }),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt || `Register failed with ${res.status}`);
    }
    const data = (await res.json()) as { token: string; userId: number; email: string; role: string };
    setToken(data.token);
    setUser({ id: data.userId, email: data.email, role: data.role });
    await persist(data);
  }, [persist]);

  const refreshMe = useCallback(async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = (await res.json()) as { userId: number; email: string; role: string };
      setUser({ id: data.userId, email: data.email, role: data.role });
    } else if (res.status === 401) {
      setToken(null);
      setUser(null);
      await clear();
    }
  }, [token, clear]);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    await clear();
  }, [clear]);

  const value = useMemo(
    () => ({ user, token, loading, error, login, register, refreshMe, logout }),
    [user, token, loading, error, login, register, refreshMe, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
