import React, { createContext, useContext, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => AuthAPI.currentSession());
  const navigate = useNavigate();

  const value = useMemo(() => ({
    session,
    login: async (username, password) => {
      const s = await AuthAPI.login({ username, password });
      setSession(s);
      return s;
    },
    logout: () => {
      AuthAPI.logout();
      setSession(null);
      navigate('/');
    },
    isAdmin: () => session?.role === 'admin',
    isDoctor: () => session?.role === 'doctor',
    isPatient: () => session?.role === 'patient',
  }), [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


