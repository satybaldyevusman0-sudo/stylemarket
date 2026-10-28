import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';
import { useToast } from './ToastContext.jsx';
import { useI18n } from './I18nContext.jsx';
import { navigate } from '../lib/router.jsx';

const FavCtx = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const { push } = useToast();
  const { t } = useI18n();
  const [ids, setIds] = useState([]);

  useEffect(() => {
    if (!user) { setIds([]); return; }
    api('/api/favorites').then((d) => setIds(d.ids)).catch(() => setIds([]));
  }, [user]);

  const toggle = useCallback(async (itemId) => {
    if (!user) {
      push(t('fav.loginNeeded'), 'info');
      navigate(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    const has = ids.includes(itemId);
    setIds((l) => (has ? l.filter((x) => x !== itemId) : [...l, itemId])); // оптимисттик жаңыртуу
    try {
      if (has) await api(`/api/favorites/${encodeURIComponent(itemId)}`, { method: 'DELETE' });
      else await api('/api/favorites', { method: 'POST', body: { itemId } });
      push(t(has ? 'fav.removed' : 'fav.added'));
    } catch (e) {
      setIds((l) => (has ? [...l, itemId] : l.filter((x) => x !== itemId)));
      push(e.message, 'error');
    }
  }, [user, ids, push, t]);

  const value = useMemo(() => ({ ids, toggle, has: (id) => ids.includes(id) }), [ids, toggle]);
  return <FavCtx.Provider value={value}>{children}</FavCtx.Provider>;
}

export const useFavorites = () => useContext(FavCtx);
