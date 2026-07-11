'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'ADMIN' | 'STAFF';

export interface User {
  username: string;
  role: UserRole;
  fullName: string;
}

interface AuthContextType {
  user: User | null;
  login: (u: string, p: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

/**
 * ⚠️ SECURITY NOTE:
 * Credentials below are for DEMO / PROTOTYPE only.
 * In production, NEVER hardcode credentials in source.
 * Replace with: server-side auth (NextAuth.js / Clerk / custom JWT endpoint).
 *
 * Demo credentials:
 *   Admin  → username: ADDECKKO  / password: Deckko
 *   Staff  → username: nvdeckko  / password: 123456
 */
const DEMO_ACCOUNTS: { username: string; password: string; user: User }[] = [
  {
    username: 'ADDECKKO',
    password: 'Deckko',
    user: { username: 'ADDECKKO', role: 'ADMIN', fullName: 'Quản Trị Viên (CEO)' },
  },
  {
    username: 'nvdeckko',
    password: '123456',
    user: { username: 'nvdeckko', role: 'STAFF', fullName: 'Nhân Viên Kho' },
  },
];

const STORAGE_KEY = 'deckko_admin_user';

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (u: string, p: string): boolean => {
    const match = DEMO_ACCOUNTS.find(
      (a) => a.username === u && a.password === p
    );
    if (match) {
      setUser(match.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(match.user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
