'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../lib/types';
import api from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  hasRole: () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('bn_token');
    const savedUser = localStorage.getItem('bn_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
        // Verify current session with backend
        api
          .get('/auth/me')
          .then((res) => {
            if (res.data?.user) {
              setUser(res.data.user);
              localStorage.setItem('bn_user', JSON.stringify(res.data.user));
            }
          })
          .catch(() => {
            localStorage.removeItem('bn_token');
            localStorage.removeItem('bn_user');
            setUser(null);
            setToken(null);
          })
          .finally(() => setLoading(false));
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('bn_token', newToken);
    localStorage.setItem('bn_user', JSON.stringify(newUser));
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('bn_token');
      localStorage.removeItem('bn_user');
      setUser(null);
      setToken(null);
      window.location.href = '/admin/login';
    }
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
