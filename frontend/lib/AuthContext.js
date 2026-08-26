'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUser, getToken, setUser, setToken, logout as apiLogout } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getUser();
    const t = getToken();
    if (u && t) setUserState(u);
    setLoading(false);
  }, []);

  const login = useCallback((userData, token) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUserState(null);
  }, []);

  // Use state user or fallback to localStorage user to prevent race conditions during router navigation
  const effectiveUser = user || (typeof window !== 'undefined' ? getUser() : null);
  const isAdmin = effectiveUser?.role === 'ADMIN' || effectiveUser?.role === 'ROLE_ADMIN' || String(effectiveUser?.role).toUpperCase() === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user: effectiveUser, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
