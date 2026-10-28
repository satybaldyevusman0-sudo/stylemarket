import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [serverError, setServerError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { user: u } = await api('/api/auth/me');
      setUser(u);
      setServerError(null);
    } catch (e) {
      setUser(null);
      setServerError(e);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    const { user: u } = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user: u } = await api('/api/auth/register', { method: 'POST', body: { name, email, password } });
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await api('/api/auth/logout', { method: 'POST', body: {} }); } finally { setUser(null); }
  }, []);

  const value = useMemo(() => ({ user, ready, serverError, isAdmin: user?.role === 'admin', login, register, logout, refresh, setUser }),
    [user, ready, serverError, login, register, logout, refresh]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
